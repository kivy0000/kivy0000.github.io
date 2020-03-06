if (document.body.clientWidth <= 460) {
	var sf = new Snowflakes({
		color : "azure",
		count : 10,
		minOpacity : 0.5,
		maxOpacity : 1
	});
} else {
	var sf = new Snowflakes({
		color : "azure",
		count : 30,
		minOpacity : 0.5,
		maxOpacity : 1
	});
}