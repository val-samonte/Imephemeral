/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/spawn.json`.
 */
export type Spawn = {
  "address": "G7nyjrAKgXJup6aGfi4Zh5RSgwi6nTVTWfxRH7q6p178",
  "metadata": {
    "name": "spawn",
    "version": "0.1.7",
    "spec": "0.1.0",
    "description": "Created with Bolt"
  },
  "instructions": [
    {
      "name": "execute2",
      "discriminator": [
        105,
        108,
        50,
        190,
        253,
        180,
        77,
        227
      ],
      "accounts": [
        {
          "name": "character"
        },
        {
          "name": "room"
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": []
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
      "name": "room",
      "discriminator": [
        156,
        199,
        67,
        27,
        222,
        23,
        185,
        94
      ]
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
      "name": "room",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "floor",
            "type": "pubkey"
          },
          {
            "name": "doors",
            "type": "u8"
          },
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "seed",
            "type": "u64"
          },
          {
            "name": "characterCount",
            "type": "u8"
          },
          {
            "name": "initialized",
            "type": "bool"
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
    }
  ]
};
