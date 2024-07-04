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

  baseDamage: number
  stabDamage: number
  slashDamage: number

  slashRange: number
  slashWide: number
  stabRange: number
  stabWide: number
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
    await this.room.storage.deleteAll()
    this.characters =
      (await this.room.storage.get<Character[]>('characters')) ?? []
  }

  static async onBeforeConnect(request: Party.Request, lobby: Party.Lobby) {
    console.log(lobby.id)

    const token = new URL(request.url).searchParams.get('token') ?? ''
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
        connected: true,
      })
    )
  }

  async onMessage(message: string, sender: Party.Connection) {
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
          baseDamage: 20,
          stabDamage: 4,
          slashDamage: 6,

          slashRange: 2,
          slashWide: 6,
          stabRange: 4,
          stabWide: 2,

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

        // notify everyone for the new character
        this.room.broadcast(
          JSON.stringify({
            type: 'update',
            characters: [myNewCharacter],
          })
        )
        this.room.storage.put('characters', this.characters)
      }

      return
    }

    if (!character) return

    const affectedCharacters = [character]

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
          character.nextMove = now + character.moveCooldown
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

        const attackBox = getAttackBox(character)

        this.characters.forEach((target) => {
          const isBlocking = now < target.nextBlock - target.blockCooldown
          if (!isBlocking && target.hp > 0 && target.id !== character.id) {
            const hit = collisionCheck(attackBox, [
              target.x,
              target.y,
              target.x + 4,
              target.y + 4,
            ])
            if (hit) {
              target.hp -=
                (character.attackType === 0
                  ? character.slashDamage
                  : character.stabDamage) + character.baseDamage
              if (target.hp <= 0) {
                character.kills++
                console.log('KILL!', character.id, target.id)
              } else {
                console.log('HIT!', character.id, target.id)
              }
              affectedCharacters.push(target)
            }
          }
          return target
        })

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

    const deadCharacterIds = affectedCharacters
      .filter((c) => c.hp <= 0)
      .map((c) => c.id)

    // apply changes
    this.characters = this.characters
      .filter((c) => c.hp > 0)
      .map((c) => {
        return affectedCharacters.find((ac) => ac.id === c.id) ?? c
      })

    this.room.broadcast(
      JSON.stringify({
        type: 'update',
        characters: affectedCharacters.filter((c) => c.hp > 0),
        remove: deadCharacterIds.length > 0 ? deadCharacterIds : undefined,
        fromAction: action.type,
      })
    )

    this.room.storage.put(
      'characters',
      this.characters.filter((c) => c.hp > 0)
    )
  }
}

function getAttackBox(character: Character) {
  let w = character.attackType === 0 ? character.slashWide : character.stabWide
  let h =
    character.attackType === 0 ? character.slashRange : character.stabRange

  const orientation = (character.facing | 0b1010) === 0b1010 // facing top or bottom
  w = orientation ? w : h
  h = orientation ? h : w

  // make a default box and based it on the character's current position

  let [b1x, b1y, b2x, b2y] = [
    character.x,
    character.y,
    character.x + w,
    character.y + h,
  ]

  // character size is 4x4
  if (orientation) {
    // center the box to the character by width
    b1x += 2 - w / 2
    b2x += 2 - w / 2
  } else {
    // center the box to the character by height
    b1y += 2 - h / 2
    b2y += 2 - h / 2
  }

  // move the box based on the character's facing
  if (character.facing & 0b0001) {
    b1x -= w
    b2x -= w
  } else if (character.facing & 0b0010) {
    b1y += 4
    b2y += 4
  } else if (character.facing & 0b0100) {
    b1x += 4
    b2x += 4
  } else if (character.facing & 0b1000) {
    b1y -= h
    b2y -= h
  }

  return [b1x, b1y, b2x, b2y]
}

function collisionCheck(box1: number[], box2: number[]) {
  // Extract points from the rectangles
  const [x1, y1, x2, y2] = box1
  const [x3, y3, x4, y4] = box2

  // Calculate the left, right, top, and bottom edges of each rectangle
  const left1 = Math.min(x1, x2)
  const right1 = Math.max(x1, x2)
  const top1 = Math.min(y1, y2)
  const bottom1 = Math.max(y1, y2)

  const left2 = Math.min(x3, x4)
  const right2 = Math.max(x3, x4)
  const top2 = Math.min(y3, y4)
  const bottom2 = Math.max(y3, y4)

  // Check if the rectangles overlap
  if (
    right1 <= left2 ||
    right2 <= left1 ||
    bottom1 <= top2 ||
    bottom2 <= top1
  ) {
    // They are touching or not overlapping
    return false
  } else {
    // They are overlapping
    return true
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
