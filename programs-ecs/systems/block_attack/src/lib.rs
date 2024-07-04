use bolt_lang::*;
use character::Character;
use character::CharacterError;

declare_id!("J3ShPaMqkkSexm6HRMSx3DFD8yx5ZDK9HApanQ9ypCwk");

#[system]
pub mod block_attack {

    pub fn execute(ctx: Context<Components>) -> Result<Components> {
        let character = &mut ctx.accounts.character;
        let payer = ctx.accounts.authority.key();
        let tick = Clock::get()?.slot;

        if character.authority != payer {
            return Err(CharacterError::PlayerIsNotPayer.into());
        }

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
