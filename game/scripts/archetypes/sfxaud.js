//
//  sfxaud.js
//  Audio for Special Effects
//

/*global GameSoundManager: false*/

//
//  UI
//
GameSoundManager.archetypes.aud_guiButtonsDown      = {   path: "sounds/gui_click.ogg", loop : false, volume : 0.8, global : true };
GameSoundManager.archetypes.aud_guiButtonsUp        = {   path: "sounds/gui_click.ogg", loop : false, volume : 0.0, global : true };
GameSoundManager.archetypes.aud_guiButtonsSelect    = {   path: "sounds/gui_over.ogg",  loop : false, volume : 0.4, global : true };
GameSoundManager.archetypes.aud_guiButtonsDeselect  = {   path: "sounds/gui_click.ogg", loop : false, volume : 0.0, global : true };

//
// FX
//

GameSoundManager.archetypes.aud_wind = {path: "sounds/standard_wind.ogg", loop : true, global : true, volume : 1.0, delayedLoad : true };
GameSoundManager.archetypes.aud_propeller = {path: "sounds/propeller.ogg", loop : true, global : true, volume : 1.4, delayedLoad : true };
GameSoundManager.archetypes.aud_propeller_fast = {path: "sounds/propeller_2.ogg", loop : true, global : true, volume : 1.8, delayedLoad : true };
GameSoundManager.archetypes.aud_ocean = {path: "sounds/ocean.ogg", loop : true, global : true, volume : 1.0, delayedLoad : true };
GameSoundManager.archetypes.aud_fleet = {path: "sounds/fleet.ogg", loop : true, global : true, volume : 1.0, delayedLoad : true, maxDistance : 200  };

GameSoundManager.archetypes.aud_gulls = {path: "sounds/gulls.ogg", loop : true, volume : 1.0, delayedLoad : true, maxDistance : 200 };
GameSoundManager.archetypes.aud_thermal = {path: "sounds/thermal_wind.ogg", loop : true, global : true, volume : 0.9, delayedLoad : true };

GameSoundManager.archetypes.aud_missionSuccess = {path: "sounds/ring_success.ogg", loop : false, global : true, volume : 1.0, delayedLoad : true };
GameSoundManager.archetypes.aud_missionFailed = {path: "sounds/ring_fail.ogg", loop : false, global : true, volume : 1.0, delayedLoad : true };
GameSoundManager.archetypes.aud_ringFail = {path: "sounds/ring_fail.ogg", loop : false, global : true, volume : 1.0, delayedLoad : true };
GameSoundManager.archetypes.aud_ringSuccess = {path: "sounds/ring_success.ogg", loop : false, global : true, volume : 1.0, delayedLoad : true };
GameSoundManager.archetypes.aud_altitudeWarning = {path: "sounds/altitude_warning.ogg", loop : false, global : true, volume : 0.5, delayedLoad : true };
GameSoundManager.archetypes.aud_boost = {path: "sounds/propeller_2.ogg", loop : false, global : true, volume : 0.5, delayedLoad : true };

GameSoundManager.oceanSoundCeiling = 500;
GameSoundManager.altitudeWarningFloorOffset = 15;
GameSoundManager.altitudeWarningPeriod = 1;
GameSoundManager.propellerFastSpeedMin = 20;
GameSoundManager.propellerFastSpeedMax = 30;
