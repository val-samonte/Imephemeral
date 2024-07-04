use bolt_lang::*;
use character::Character;
use character::CharacterError;

declare_id!("3i3fGAGsbmkGqFxKKtbF3fQEtzCrXXyLpB2Xk5eUShcH");

#[system]
pub mod move_character {

    pub fn execute(ctx: Context<Components>, args: Args) -> Result<Components> {
        let character = &mut ctx.accounts.character;

        if !((args.facing == 0b1000 && character.y.saturating_sub(1) == args.y && character.x == args.x) ||
            (args.facing == 0b0100 && character.x.saturating_add(1) == args.x && character.y == args.y) || 
            (args.facing == 0b0010 && character.y.saturating_add(1) == args.y && character.x == args.x) ||
            (args.facing == 0b0001 && character.x.saturating_sub(1) == args.x && character.y == args.y))
        {
            return Err(CharacterError::InvalidMove.into());
        }

        // check boundary
        character.x = args.x.clamp(8, 40);
        character.y = args.y.clamp(8, 40);
        character.facing = args.facing;

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
        x: u8,
        y: u8,
        facing: u8,
    }

}
