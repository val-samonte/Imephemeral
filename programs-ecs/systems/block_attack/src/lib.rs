use bolt_lang::*;
use character::Character;
use character::CharacterError;

declare_id!("9v8LCR4ELp644ELYd445MwjJB41tnCBL1G3BjHztqbAp");

#[system]
pub mod block_attack {

    pub fn execute(ctx: Context<Components>) -> Result<Components> {
        let character = &mut ctx.accounts.character;
        let tick = Clock::get()?.slot;

        if character.hp <= 0 {
            return Err(CharacterError::Dead.into());
        }

        if tick < character.next_block {
            return Err(CharacterError::BlockCooldown.into());
        }

        character.next_block = tick + character.block_duration + character.block_cooldown;

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub character: Character,
    }

}
