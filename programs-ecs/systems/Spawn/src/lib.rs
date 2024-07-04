use bolt_lang::*;
use character::Character;

declare_id!("HXxwtNm4bNgDVEaZtzb4pq8D5CgbcAmDH9p8L6uHdVQx");

#[system]
pub mod spawn {

    pub fn execute(ctx: Context<Components>, args: Args) -> Result<Components> {
        let character = &mut ctx.accounts.character;
        character.room = args.room.key();
        character.authority = ctx.accounts.authority.key();
        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub character: Character,
    }

    #[arguments]
    struct Args {
        room: Pubkey,
    }
}
