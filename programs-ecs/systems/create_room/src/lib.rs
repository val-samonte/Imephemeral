use bolt_lang::*;
use room::Room;
use room::RoomError;

declare_id!("5unwDiZx5CesRy4BW42jFyBAeg3qqSAk3R2vNgsg83se");

#[system]
pub mod create_room {

    pub fn execute(ctx: Context<Components>, args: Args) -> Result<Components> {
        let room = &mut ctx.accounts.room;

        if room.initialized {
            return Err(RoomError::AlreadyInitialized.into());
        }
        room.floor = Pubkey::new_from_array(args.floor);
        room.depth = 0;
        room.seed = 0;
        room.character_count = 0;
        room.initialized = true;
        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub room: Room,
    }

    #[arguments]
    struct Args {
        floor: [u8; 32],
    }

}
