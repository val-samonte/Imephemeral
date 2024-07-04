use bolt_lang::*;
use character::Character;

declare_id!("HXxwtNm4bNgDVEaZtzb4pq8D5CgbcAmDH9p8L6uHdVQx");

#[system]
pub mod spawn {

    pub fn execute(ctx: Context<Components>, args: Args) -> Result<Components> {
        let character = &mut ctx.accounts.character;
        character.room = Pubkey::new_from_array(args.room);
        character.authority = ctx.accounts.authority.key();
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
