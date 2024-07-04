use bolt_lang::*;
use character::Character;
use character::CharacterError;

declare_id!("4vQKQW8wVAEFQrMmAb5mDPkzMzpRLywc15gWJWgNDgKi");

#[system]
pub mod switch_attack_type {
    
    pub fn execute(ctx: Context<Components>, args: Args) -> Result<Components> {
        let character = &mut ctx.accounts.character;
        let payer = ctx.accounts.authority.key();

        if character.authority != payer {
            return Err(CharacterError::PlayerIsNotPayer.into());
        }

        if character.hp <= 0 {
            return Err(CharacterError::Dead.into());
        }

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
