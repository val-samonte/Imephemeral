use bolt_lang::*;
use character::Character;

declare_id!("8UbJwevxK4t1za9J2yCoNnKGvf7wamQaLXwbKSifjT3T");

#[system]
pub mod spawn {

    pub fn execute(ctx: Context<Components>, args: Args) -> Result<Components> {
        let character = &mut ctx.accounts.character;
        character.room = Pubkey::new_from_array(args.room);
        character.authority = ctx.accounts.authority.key();

        character.reset();

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub character: Character,
    }

    #[arguments]
    struct Args {
        room: [u8; 32],
    }
}
