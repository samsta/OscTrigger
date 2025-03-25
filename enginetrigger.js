autowatch = 1
outlets = 1
inlets = 1

decks = [{}, {}, {}, {}];


function getScene(name)
{
	var liveSet = new LiveAPI("live_set");
    var sceneCount = liveSet.getcount("scenes");

    for (var i = 0; i < sceneCount; i++) {
        var scene = new LiveAPI("live_set scenes " + i);
        var scene_name = String(scene.get("name"));

		var sempos = scene_name.indexOf(";");
		if (sempos == -1) {
			post("found scene, but no beat: " + scene_name + "\n");
			continue;
		}
		
		var beat = Number(scene_name.substring(sempos+1));
		scene_name = scene_name.substring(0, sempos);
		
		wildcard_end = scene_name[scene_name.length-1] == '*';
		var tmp_name = name.toLowerCase();
		var tmp_scene_name = scene_name.toLowerCase();
		
		if (wildcard_end) {
			tmp_scene_name = tmp_scene_name.substring(0, tmp_scene_name.length-1);
			tmp_name = tmp_name.substring(0, tmp_scene_name.length);
		}
				
		if (tmp_scene_name != tmp_name) {
			continue;
		}

		return {"name": scene_name, "beat": beat, "path": "path live_set scenes " + i};
    }
	return null;
}

function anything()
{
	var mname = messagename;
	const prefix = "/Engine/Deck";
	
	if (mname.indexOf(prefix) != 0) {
		post("Not an engine message: " + mname);
		return;
	}
	
	var decknum = Number(mname.substring(prefix.length, prefix.length+1));
	mname = mname.substring(prefix.length+2);
	
	if (mname == "Track/SongName") {
		scene = getScene(arguments[0]);
		if (scene == null)
		{
			post("No scene for " + arguments[0] + "\n");
			decks[decknum-1] = {};
			return;
		}
		
		decks[decknum-1] = scene;
		
		post("found scene '" + scene.name + "', will trigger at " + scene.beat + "\n");
		return;
	}
	
	post(decks[decknum-1].beat);
	
	if (mname == "Beat" && decks[decknum-1].beat > 0)
	{
		var trig_beat = decks[decknum-1].beat;
		var cur_beat = Number(arguments[0]);
		post(cur_beat + " vs " + trig_beat);
		post(typeof(cur_beat) + " vs " + typeof(trig_beat));
		if (cur_beat < trig_beat && cur_beat > trig_beat - 3)
		{
			post("triggering\n");
			outlet(0, decks[decknum-1].path.split(" "));
		}
	}
	
}