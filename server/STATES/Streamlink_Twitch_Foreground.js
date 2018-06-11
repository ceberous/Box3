function wOpenLiveTwitchStreamlink( wUserName , wQuality ) {
	wQuality = wQuality || "best";
	STREAM_LINK_MAN.openLink( wUserName , wQuality );
}
async function wStopLiveTwitchStreamlink() {
	wcl("inside stop twitch");
	await STREAM_LINK_MAN.quit();
}