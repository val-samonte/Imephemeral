use bolt_lang::*;

declare_id!("F1vWgZHGbB4zJAg4apRDheEoT4VLsKxeF869sd246jQo");

#[component]
pub struct Character {
    pub room: Pubkey,
    pub authority: Pubkey,

    pub hp: u8,
    pub max_hp: u8,
    pub kills: u16,

    pub x: u8,
    pub y: u8,
    pub facing: u8,
    pub next_move: u64,
    
    pub attack_type: u8,
    pub next_attack: u64,
    
    pub base_damage: u8,
    pub slash_damage: u8,
    pub slash_range: u8,
    pub slash_wide: u8,
    pub stab_damage: u8,
    pub stab_range: u8,
    pub stab_wide: u8,
    
    pub next_block: u64,
    
    pub move_cooldown: u64,
    pub attack_cooldown: u64,
    pub block_cooldown: u64,
    pub block_duration: u64,
}

impl Default for Character {
    fn default() -> Self {
        Self::new(CharacterInit {
            room: Pubkey::default(),
            authority: Pubkey::default(),
            hp: 100,
            max_hp: 100,
            kills: 0,
            x: 24,
            y: 24,
            facing: 0,
            next_move: 0,
            attack_type: 0, // 0 slash, 1 stab
            next_attack: 0,
            base_damage: 20,
            slash_damage: 6,
            slash_range: 2,
            slash_wide: 6,
            stab_damage: 4,
            stab_range: 4,
            stab_wide: 2,
            next_block: 0,
            // per tick is around 400ms, if MagicBlock, around 100ms
            move_cooldown: 1,
            attack_cooldown: 3,
            block_cooldown: 3, 
            block_duration: 2, 
        })
    }
}

#[error_code]
pub enum CharacterError {
    #[msg("The character move distance should be exactly 1 and should be facing the correct direction.")]
    InvalidMove,
}