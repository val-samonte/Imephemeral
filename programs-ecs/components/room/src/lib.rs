use bolt_lang::*;

declare_id!("7oUS15YgBG1AukRmUPsitnUYNDqRHEyHCDLdNq8gwPdS");

#[component]
#[derive(Default)]
pub struct Room {
    pub floor: Pubkey,
    pub depth: u64,
    pub seed: u64,
    pub character_count: u8,
    pub initialized: bool,
}


#[error_code]
pub enum RoomError {
    #[msg("Room is already initialized.")]
    AlreadyInitialized,
    #[msg("Room is not ready.")]
    NotReady,
    #[msg("Room is full.")]
    CapacityFull,
}