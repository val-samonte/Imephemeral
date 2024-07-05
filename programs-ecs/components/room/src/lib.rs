use bolt_lang::*;

declare_id!("8eoFAxiRrAh5RPPuDNyJT6CdJRQLHbs2ntzJRHZ2dsfb");

#[component(delegate)]
#[derive(Default)]
pub struct Room {
    pub floor: Pubkey,
    pub doors: u8,
    pub index: u8,
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