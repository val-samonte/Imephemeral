use bolt_lang::*;

declare_id!("9PHmry7gYyYi21sQwpxMQnbsuuenzyupkY4n87t9HzEj");

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

impl Character {
    pub fn get_attack_box(&self) -> (u8, u8, u8, u8) {
        let mut w = if self.attack_type == 0 {
            self.slash_wide
        } else {
            self.stab_wide
        };
        let mut h = if self.attack_type == 0 {
            self.slash_range
        } else {
            self.stab_range
        };
    
        let orientation = (self.facing | 0b1010) == 0b1010; // facing top or bottom
        if !orientation {
            std::mem::swap(&mut w, &mut h);
        }
    
        // make a default box and base it on the character's current position
        let mut b1x = self.x;
        let mut b1y = self.y;
        let mut b2x = self.x + w;
        let mut b2y = self.y + h;
    
        // character size is 4x4
        if orientation {
            // center the box to the character by width
            b1x = b1x + 2 - w / 2;
            b2x = b2x + 2 - w / 2;
        } else {
            // center the box to the character by height
            b1y = b1y + 2 - h / 2;
            b2y = b2y + 2 - h / 2;
        }
    
        // move the box based on the character's facing
        if self.facing & 0b0001 != 0 {
            b1x -= w;
            b2x -= w;
        } else if self.facing & 0b0010 != 0 {
            b1y += 4;
            b2y += 4;
        } else if self.facing & 0b0100 != 0 {
            b1x += 4;
            b2x += 4;
        } else if self.facing & 0b1000 != 0 {
            b1y -= h;
            b2y -= h;
        }
    
        (b1x, b1y, b2x, b2y)
    }

    pub fn collision_check(&self, box2: (u8, u8, u8, u8)) -> bool {
        let x1 = self.x;
        let y1 = self.y;
        let x2 = self.x + 4;
        let y2 = self.y + 4;
        let (x3, y3, x4, y4) = box2;
    
        // Calculate the left, right, top, and bottom edges of each rectangle
        let left1 = x1.min(x2);
        let right1 = x1.max(x2);
        let top1 = y1.min(y2);
        let bottom1 = y1.max(y2);
    
        let left2 = x3.min(x4);
        let right2 = x3.max(x4);
        let top2 = y3.min(y4);
        let bottom2 = y3.max(y4);
    
        // Check if the rectangles overlap
        if right1 <= left2 || right2 <= left1 || bottom1 <= top2 || bottom2 <= top1 {
            // They are touching or not overlapping
            false
        } else {
            // They are overlapping
            true
        }
    }

    pub fn reset(&mut self) {
        self.hp = 100;
        self.max_hp = 100;
        self.kills = 0;
        self.x = 24;
        self.y = 24;
        self.facing = 0;
        self.next_move = 0;
        self.attack_type = 0;
        self.next_attack = 0;
        self.next_block = 0;
        self.move_cooldown = 1;
        self.attack_cooldown = 3;
        self.block_cooldown = 3;
        self.block_duration = 2;
    }
}

#[error_code]
pub enum CharacterError {
    #[msg("The payer is unauthorized to control the character.")]
    PlayerIsNotPayer,
    #[msg("Invalid move direction.")]
    InvalidMove,
    #[msg("The character is dead.")]
    Dead,
    #[msg("Attack is currently in cooldown.")]
    AttackCooldown,
    #[msg("Cannot attack while currently blocking.")]
    AttackWhileBlocking,
    #[msg("Block is currently in cooldown.")]
    BlockCooldown,
}