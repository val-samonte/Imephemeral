import { PublicKey } from '@solana/web3.js'
import * as AttackIdl from '../../../../target/idl/attack.json'
import * as BlockAttackIdl from '../../../../target/idl/block_attack.json'
import * as CharacterIdl from '../../../../target/idl/character.json'
import * as CreateRoomIdl from '../../../../target/idl/create_room.json'
import * as MoveCharacterIdl from '../../../../target/idl/move_character.json'
import * as RoomIdl from '../../../../target/idl/room.json'
import * as SpawnIdl from '../../../../target/idl/spawn.json'
import * as SwitchAttackTypeIdl from '../../../../target/idl/switch_attack_type.json'
import { Attack } from '../../../../target/types/attack'
import { BlockAttack } from '../../../../target/types/block_attack'
import { Character } from '../../../../target/types/character'
import { CreateRoom } from '../../../../target/types/create_room'
import { MoveCharacter } from '../../../../target/types/move_character'
import { Room } from '../../../../target/types/room'
import { Spawn } from '../../../../target/types/spawn'
import { SwitchAttackType } from '../../../../target/types/switch_attack_type'

export const WORLD_PDA = new PublicKey(
  'JBupPMmv4zaXa5c8EdubsCPvoHZwCK7mwnDfmfs8dC5Y'
)

export const DUMMY_ROOM_PDA = new PublicKey(
  'GYVYgZm5Cf2PQGNDYWQtqxhGgbk1X4zSdMQzuhiV8xkw'
)

const componentCharacter = CharacterIdl as Character
const componentRoom = RoomIdl as Room
const systemCreateRoom = CreateRoomIdl as CreateRoom
const systemSpawn = SpawnIdl as Spawn
const systemMoveCharacter = MoveCharacterIdl as MoveCharacter
const systemSwitchAttackType = SwitchAttackTypeIdl as SwitchAttackType
const systemAttack = AttackIdl as Attack
const systemBlockAttack = BlockAttackIdl as BlockAttack

export const COMPONENT_CHARACTER_PROGRAM_ID = new PublicKey(
  componentCharacter.address
)
export const COMPONENT_ROOM_PROGRAM_ID = new PublicKey(componentRoom.address)
export const SYSTEM_CREATE_ROOM_PROGRAM_ID = new PublicKey(
  systemCreateRoom.address
)
export const SYSTEM_SPAWN_PROGRAM_ID = new PublicKey(systemSpawn.address)
export const SYSTEM_MOVE_CHARACTER_PROGRAM_ID = new PublicKey(
  systemMoveCharacter.address
)
export const SYSTEM_SWITCH_ATTACK_TYPE_PROGRAM_ID = new PublicKey(
  systemSwitchAttackType.address
)
export const SYSTEM_ATTACK_PROGRAM_ID = new PublicKey(systemAttack.address)
export const SYSTEM_BLOCK_ATTACK_PROGRAM_ID = new PublicKey(
  systemBlockAttack.address
)
