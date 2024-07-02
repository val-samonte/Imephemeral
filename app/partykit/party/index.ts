import type * as Party from 'partykit/server'
import bs58 from 'bs58'
import { sign } from 'tweetnacl'

interface Character {
  id: string
  hp: number
  maxHp: number
  kills: number
  // MOVE
  x: number
  y: number
  facing: number
  nextMove: number
  canMove: boolean
  moveCooldown: number
  // ATTACK
  attackCooldown: number
  nextAttack: number
  canAttack: boolean
  attackType: number // 0: slash, 1: stab
  // BLOCK
  blockCooldown: number
  blockDuration: number
  nextBlock: number
  canBlock: boolean
  // ROLL
  rollDuration: number
  rollCooldown: number
  nextRoll: number
  canRoll: boolean
}

export enum CharacterActionType {
  JOIN = 'JOIN',
  MOVE = 'MOVE',
  SWITCH_ATTACK = 'SWITCH_ATTACK',
  ATTACK = 'ATTACK',
  BLOCK = 'BLOCK',
  ROLL = 'ROLL',
}

export type CharacterAction =
  | {
      type: CharacterActionType.JOIN
    }
  | {
      type: CharacterActionType.MOVE
      x: number
      y: number
      facing: number
    }
  | {
      type: CharacterActionType.SWITCH_ATTACK
    }
  | {
      type: CharacterActionType.ATTACK
    }
  | {
      type: CharacterActionType.BLOCK
    }
  | {
      type: CharacterActionType.ROLL
    }

export default class Server implements Party.Server {
  constructor(readonly room: Party.Room) {}

  characters: Character[] = []

  async onStart() {
    this.characters =
      (await this.room.storage.get<Character[]>('characters')) ?? []
  }

  static async onBeforeConnect(request: Party.Request, lobby: Party.Lobby) {
    console.log(lobby.id)

    const token = new URL(request.url).searchParams.get('token') ?? ''
    console.log(token)
    const [address, signature] = token.split('.')

    if (!address) {
      return new Response('Unauthorized', { status: 401 })
    }
    const message = bs58.decode(address)

    try {
      if (!sign.detached.verify(message, bs58.decode(signature), message)) {
        return new Response('Unauthorized', { status: 401 })
      }
    } catch (e) {
      console.log(e)
      return new Response('Unauthorized', { status: 401 })
    }

    request.headers.set('X-Session-Address', address)

    return request
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    const sessionAddress = ctx.request.headers.get('X-Session-Address')
    conn.setState({ sessionAddress })

    if (!sessionAddress) return

    conn.send(
      JSON.stringify({
        type: 'update',
        characters: this.characters,
      })
    )
  }

  onMessage(message: string, sender: Party.Connection) {
    const now = Date.now()
    const action = JSON.parse(message) as CharacterAction
    const sessionAddress = (sender.state as any)?.sessionAddress
    const character = this.characters.find((c) => c.id === sessionAddress)

    if (action.type === CharacterActionType.JOIN) {
      if (!character) {
        const myNewCharacter = {
          id: sessionAddress,
          hp: 100,
          maxHp: 100,
          kills: 0,
          // MOVE
          x: 24,
          y: 24,
          facing: 0b0100,
          nextMove: now,
          canMove: true,
          moveCooldown: 100,
          // ATTACK
          attackCooldown: 1000,
          nextAttack: now,
          canAttack: false,
          attackType: 0,
          // BLOCK
          blockCooldown: 1000,
          blockDuration: 1000,
          nextBlock: now,
          canBlock: false,
          // isBlocking: false,
          // ROLL
          rollDuration: 1000,
          rollCooldown: 3000,
          nextRoll: now,
          canRoll: false,
          // isRolling: false,
        }
        this.characters.push(myNewCharacter)
        this.room.storage.put('characters', this.characters)

        // notify everyone for the new character
        this.room.broadcast(
          JSON.stringify({
            type: 'update',
            characters: [myNewCharacter],
          })
        )
      }
      return
    }

    if (!character) return

    switch (action.type) {
      case CharacterActionType.MOVE: {
        if (!canMove(character)) break
        const totalSteps = 52
        const borderTop = 8
        const borderRight = totalSteps - 8 - 4
        const borderBottom = totalSteps - 8 - 4
        const borderLeft = 8

        character.facing = action.facing

        // check diff, should be only 1 step
        if (
          Math.abs(character.x - action.x) +
            Math.abs(character.y - action.y) ===
          1
        ) {
          // check boundary using Math.min and Math.max
          character.x = Math.min(Math.max(action.x, borderLeft), borderRight)
          character.y = Math.min(Math.max(action.y, borderTop), borderBottom)
        }

        break
      }
      case CharacterActionType.SWITCH_ATTACK: {
        character.attackType = character.attackType === 1 ? 0 : 1
        break
      }
      case CharacterActionType.ATTACK: {
        if (!canAttack(character)) break
        character.nextAttack = now + character.attackCooldown
        break
      }
      case CharacterActionType.BLOCK: {
        if (!canBlock(character)) break
        character.nextBlock =
          now + character.blockDuration + character.blockCooldown
        break
      }
      case CharacterActionType.ROLL: {
        if (!canRoll(character)) break
        break
      }
    }

    // update list
    this.characters = this.characters.map((c) => {
      if (c.id === character.id) {
        return character
      }
      return c
    })
    this.room.storage.put('characters', this.characters)

    // broadcast changes
    this.room.broadcast(
      JSON.stringify({
        type: 'update',
        characters: [character],
      })
    )
  }
}

function canMove(character: Character) {
  if (character.hp <= 0) return false
  return Date.now() > character.nextMove
}

function canAttack(character: Character) {
  if (character.hp <= 0) return false
  const isBlocking = Date.now() < character.nextBlock - character.blockCooldown
  const isRolling = Date.now() < character.nextRoll - character.rollCooldown
  if (isBlocking || isRolling) return false
  return Date.now() > character.nextAttack
}

function canBlock(character: Character) {
  if (character.hp <= 0) return false
  return Date.now() > character.nextBlock
}

function canRoll(character: Character) {
  if (character.hp <= 0) return false
  return Date.now() > character.nextRoll
}

Server satisfies Party.Worker
