use bolt_lang::*;
use character::Character;
use character::CharacterError;
use room::Room;
use room::RoomError;

declare_id!("G7nyjrAKgXJup6aGfi4Zh5RSgwi6nTVTWfxRH7q6p178");

#[system]
pub mod spawn {

    pub fn execute(ctx: Context<Components>) -> Result<Components> {
        let character = &mut ctx.accounts.character;
        let room = &mut ctx.accounts.room;

        if room.initialized == false {
            return Err(RoomError::NotReady.into());
        }

        if character.room == room.key() {
            return Err(CharacterError::AlreadyInRoom.into());
        }

        match room.character_count.checked_add(1) {
            Some(_) => (),
            None => return Err(RoomError::CapacityFull.into()),
        }
         
        character.room = room.key();
        character.authority = ctx.accounts.authority.key();
        character.reset();
        room.character_count += 1;

        Ok(ctx.accounts)
    }

    #[system_input]
    pub struct Components {
        pub character: Character,
        pub room: Room,
    }
}
