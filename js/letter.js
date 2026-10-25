/* Daily letter: a thought, a brain fact, and a small challenge. New every day, nothing sent anywhere. */
(function () {
  "use strict";
  var RC = window.RC, el = RC.el, D = window.RC_DATA;
  var THOUGHTS = ["You don't have to feel ready. You only have to start the next small thing.", "A slow day in recovery is still a day in recovery.", "Progress rarely announces itself. Look at where you were a month ago.", "Cravings are loud. Loud isn't the same as true.", "Asking for help is a skill, not a weakness.", "Today's job is small: get through today.", "You can feel the urge and still choose something else.", "Rest counts as part of the work.", "The you who kept going last week would be proud of today.", "A setback is a data point, not a verdict.", "Be as patient with yourself as you'd be with a friend.", "Small, boring routines build lives that hold.", "You're allowed to be proud of the days nobody else notices.", "What you practice grows. Pick what you want to grow.", "Hard feelings are weather. They move through.", "Done imperfectly still counts.", "Connection beats isolation, even when isolation feels easier.", "Quiet progress is still progress.", "You don't have to fix everything today. Just don't make it harder.", "Today is a good day to be kind to the person you're becoming."];
  var FACTS = [["Cravings often rise, peak, and fade within about 20 to 30 minutes if you don't act on them.", "Craving Neurobiology"], ["Putting a feeling into specific words has been linked to calmer amygdala activity.", "Emotion Labeling"], ["Your brain strengthens whatever you practice, whether it's a habit you want or one you don't.", "Neuroplasticity"], ["Breathing out longer than you breathe in nudges your body toward its rest-and-digest state.", "Body Awareness"], ["One night of poor sleep can make emotional reactions stronger and self-control weaker.", "Sleep and Exercise"], ["Dopamine is more about wanting than liking, which is why a craving can show up even when the thing no longer feels good.", "Dopamine and Reward"], ["Old learning isn't erased. New learning builds a competing memory, which is why practice beats willpower.", "Fear Extinction"], ["Stress can set off cravings with no obvious trigger. On hard days, treat the stress first.", "Stress and the HPA Axis"], ["In imaging studies, dopamine function and brain structure partly recover with sustained abstinence over months to years.", "Addiction & The Brain"], ["Reappraising a situation is linked to lower amygdala activity, so a new interpretation can change the reaction itself.", "Cognitive Reframing"], ["Replaying problems is your default mode network on autopilot. Noticing it is the first step out.", "Rumination and the Default Mode Network"], ["Your window of tolerance is the zone where you can think and feel at the same time. It can widen with practice.", "Window of Tolerance"], ["A craving often starts as a body sensation before it becomes a thought: a tight chest, restless hands.", "Interoception"], ["Waiting 10 minutes before acting gives an urge time to weaken and your prefrontal brakes time to catch up.", "Impulse Control"]];
  var CHALLENGES = ["Text one person just to say hi.", "Take a 10-minute walk with no phone.", "Drink a full glass of water before your next meal.", "Write down one thing you did well today.", "Name your feeling in three specific words.", "Do 2 minutes of slow breathing: in for 4, out for 6.", "Tidy one small spot: a drawer, a desk, a shelf.", "Plan tomorrow's hardest hour.", "Go to bed 30 minutes earlier tonight.", "Do something kind for someone without mentioning it.", "Read one lesson in the Brain section.", "Step outside for 5 minutes of daylight.", "Eat something with protein within an hour of waking.", "Call or text someone from your support list."];

  function dayIndex() {
    var n = new Date(), start = new Date(n.getFullYear(), 0, 0);
    return n.getFullYear() * 366 + Math.floor((n - start) / 86400000);
  }
  RC.dailyLetter = function () {
    var day = dayIndex(), fact = FACTS[day % FACTS.length], idx = -1;
    D.lessons.forEach(function (l, i) { if (l.title === fact[1]) idx = i; });
    return el("section", { class: "card letter", "aria-labelledby": "letter-h" }, [
      el("h2", { id: "letter-h", text: "Today's letter", style: "margin-top:0" }),
      el("p", { class: "muted", text: new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) }),
      el("h3", { text: "Thought for today" }), el("p", { text: THOUGHTS[day % THOUGHTS.length] }),
      el("h3", { text: "Did you know?" }), el("p", { text: fact[0] }),
      idx >= 0 ? el("a", { class: "btn ghost", href: "#/lesson/" + idx, text: "Read the lesson: " + fact[1] }) : null,
      el("h3", { text: "Small challenge" }), el("p", { text: CHALLENGES[(day + 3) % CHALLENGES.length] }),
      el("p", { class: "note", text: "New every day. Stored in the app. Nothing is sent or tracked." })
    ]);
  };
})();
