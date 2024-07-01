use anchor_lang::prelude::*;

declare_id!("5FBt7iEmZoUMg1bfRnMGHncm3XtbhbvPjctoPWxRtbiW");

#[program]
pub mod imephemeral {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
