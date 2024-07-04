use bolt_lang::*;
use character::Character;

declare_id!("6nAF6HLVMzJSU76HGwFX9FWxBs75r37ChUX6xeVhYzq2");

#[system]
pub mod switch_attack_type {
    
    pub fn execute(ctx: Context<Components>, args: Args) -> Result<Components> {
        let character = &mut ctx.accounts.character;
        character.attack_type = args.attack_type;
        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub character: Character,
    }

    #[arguments]
    struct Args {
        attack_type: u8,
    }

}
