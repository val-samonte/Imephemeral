use bolt_lang::*;
use character::Character;
use character::CharacterError;

declare_id!("Emr1nmjo96yEHNJrcFCF6eEhddhvsdY2woNTJFZMEBkU");

#[system]
pub mod move_character {

    pub fn execute(ctx: Context<Components>, args: Args) -> Result<Components> {
        let character = &mut ctx.accounts.character;
        let payer = ctx.accounts.authority.key();

        if character.authority != payer {
            return Err(CharacterError::PlayerIsNotPayer.into());
        }

        if character.hp <= 0 {
            return Err(CharacterError::Dead.into());
        }

        match args.direction {
            0b1000 => character.y = character.y.saturating_sub(1).clamp(8, 40),
            0b0100 => character.x = character.x.saturating_add(1).clamp(8, 40),
            0b0010 => character.y = character.y.saturating_add(1).clamp(8, 40),
            0b0001 => character.x = character.x.saturating_sub(1).clamp(8, 40),
            _ => return Err(CharacterError::InvalidMove.into()),
        }

        character.facing = args.direction;

        // todo: apply cooldown
        // Clock::get()?.slot; get's the current slot, which will be around 400ms per tick

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub character: Character,
    }

    #[arguments]
    struct Args {
        direction: u8,
    }

}
