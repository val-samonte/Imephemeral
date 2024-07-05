/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/character.json`.
 */
export type Character = {
  "address": "HxkYZ6hAFhVpjEMtLDfYwDmMUCu5ctzB4hLG2bjCH1sB",
  "metadata": {
    "name": "character",
    "version": "0.1.7",
    "spec": "0.1.0",
    "description": "Created with Bolt"
  },
  "instructions": [
    {
      "name": "allowUndelegation",
      "discriminator": [
        255,
        66,
        82,
        208,
        247,
        5,
        210,
        126
      ],
      "accounts": [
        {
          "name": "baseAccount"
        },
        {
          "name": "delegationRecord"
        },
        {
          "name": "delegationMetadata",
          "writable": true
        },
        {
          "name": "buffer"
        },
        {
          "name": "delegationProgram"
        }
      ],
      "args": []
    },
    {
      "name": "delegate",
      "discriminator": [
        90,
        147,
        75,
        178,
        85,
        88,
        4,
        137
      ],
      "accounts": [
        {
          "name": "payer",
          "signer": true
        },
        {
          "name": "entity"
        },
        {
          "name": "account",
          "writable": true
        },
        {
          "name": "ownerProgram"
        },
        {
          "name": "buffer",
          "writable": true
        },
        {
          "name": "delegationRecord",
          "writable": true
        },
        {
          "name": "delegateAccountSeeds",
          "writable": true
        },
        {
          "name": "delegationProgram"
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "validUntil",
          "type": "i64"
        },
        {
          "name": "commitFrequencyMs",
          "type": "u32"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "data",
          "writable": true
        },
        {
          "name": "entity"
        },
        {
          "name": "authority"
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "processUndelegation",
      "discriminator": [
        196,
        28,
        41,
        206,
        48,
        37,
        51,
        167
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true
        },
        {
          "name": "buffer"
        },
        {
          "name": "payer",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "accountSeeds",
          "type": {
            "vec": "bytes"
          }
        }
      ]
    },
    {
      "name": "update",
      "discriminator": [
        219,
        200,
        88,
        176,
        158,
        63,
        253,
        127
      ],
      "accounts": [
        {
          "name": "boltComponent",
          "writable": true
        },
        {
          "name": "authority"
        },
        {
          "name": "instructionSysvarAccount",
          "address": "Sysvar1nstructions1111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "character",
      "discriminator": [
        140,
        115,
        165,
        36,
        241,
        153,
        102,
        84
      ]
    },
    {
      "name": "entity",
      "discriminator": [
        46,
        157,
        161,
        161,
        254,
        46,
        79,
        24
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyInRoom",
      "msg": "Already joined the room."
    },
    {
      "code": 6001,
      "name": "playerIsNotPayer",
      "msg": "The payer is unauthorized to control the character."
    },
    {
      "code": 6002,
      "name": "invalidMove",
      "msg": "Invalid move direction."
    },
    {
      "code": 6003,
      "name": "dead",
      "msg": "The character is dead."
    },
    {
      "code": 6004,
      "name": "attackCooldown",
      "msg": "Attack is currently in cooldown."
    },
    {
      "code": 6005,
      "name": "attackWhileBlocking",
      "msg": "Cannot attack while currently blocking."
    },
    {
      "code": 6006,
      "name": "blockCooldown",
      "msg": "Block is currently in cooldown."
    }
  ],
  "types": [
    {
      "name": "boltMetadata",
      "docs": [
        "Metadata for the component."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "character",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "room",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "hp",
            "type": "u8"
          },
          {
            "name": "maxHp",
            "type": "u8"
          },
          {
            "name": "kills",
            "type": "u16"
          },
          {
            "name": "x",
            "type": "u8"
          },
          {
            "name": "y",
            "type": "u8"
          },
          {
            "name": "facing",
            "type": "u8"
          },
          {
            "name": "nextMove",
            "type": "u64"
          },
          {
            "name": "attackType",
            "type": "u8"
          },
          {
            "name": "nextAttack",
            "type": "u64"
          },
          {
            "name": "baseDamage",
            "type": "u8"
          },
          {
            "name": "slashDamage",
            "type": "u8"
          },
          {
            "name": "slashRange",
            "type": "u8"
          },
          {
            "name": "slashWide",
            "type": "u8"
          },
          {
            "name": "stabDamage",
            "type": "u8"
          },
          {
            "name": "stabRange",
            "type": "u8"
          },
          {
            "name": "stabWide",
            "type": "u8"
          },
          {
            "name": "nextBlock",
            "type": "u64"
          },
          {
            "name": "moveCooldown",
            "type": "u64"
          },
          {
            "name": "attackCooldown",
            "type": "u64"
          },
          {
            "name": "blockCooldown",
            "type": "u64"
          },
          {
            "name": "blockDuration",
            "type": "u64"
          },
          {
            "name": "boltMetadata",
            "type": {
              "defined": {
                "name": "boltMetadata"
              }
            }
          }
        ]
      }
    },
    {
      "name": "entity",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          }
        ]
      }
    }
  ]
};