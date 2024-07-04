use bolt_lang::*;
use character::Character;
use character::CharacterError;

declare_id!("AiHovHVkz1uDD5omYKQRniPVkvZqkefRHmqgcpQKBrnc");

#[system]
pub mod attack {

    pub fn execute(ctx: Context<Components>) -> Result<Components> {
        let character = &mut ctx.accounts.character;
        let target = &mut ctx.accounts.target;
        let payer = ctx.accounts.authority.key();
        let tick = Clock::get()?.slot;

        if character.authority != payer {
            return Err(CharacterError::PlayerIsNotPayer.into());
        }

        if character.hp <= 0 {
            return Err(CharacterError::Dead.into());
        }

        if tick < character.next_block.saturating_sub(character.block_cooldown) {
            return Err(CharacterError::AttackWhileBlocking.into());
        }

        if tick < character.next_attack {
            return Err(CharacterError::AttackCooldown.into());
        }

        character.next_attack = tick + character.attack_cooldown;

        let target_same_room = character.room == target.room;
        let target_is_blocking = tick < target.next_block.saturating_sub(target.block_cooldown);

        if target_same_room && !target_is_blocking && target.hp > 0 {
            let hit = target.collision_check( character.get_attack_box() );

            if hit {
                let damage = if character.attack_type == 0 {
                    character.slash_damage
                } else {
                    character.stab_damage
                } + character.base_damage;

                target.hp = target.hp.saturating_sub(damage);

                if target.hp == 0 {
                    character.kills = character.kills.saturating_add(1);
                }
            }
        }

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub character: Character,
        pub target: Character,
    }

}
