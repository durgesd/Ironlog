/* ==========================================================================
   IRONLOG — Exercise Library
   Exercises grouped by individual muscle for targeted, effective progress.
   Each muscle has a display color used for chips, bars, and tags.
   ========================================================================== */

const MUSCLE_GROUPS = [
  { key: "Chest",      color: "#E8B330" },
  { key: "Back",       color: "#5FA8D3" },
  { key: "Shoulders",  color: "#C4482E" },
  { key: "Biceps",     color: "#8CC084" },
  { key: "Triceps",    color: "#D98E4A" },
  { key: "Forearms",   color: "#B79A6B" },
  { key: "Quads",      color: "#D6564C" },
  { key: "Hamstrings", color: "#9B6BC7" },
  { key: "Glutes",     color: "#E06B9F" },
  { key: "Calves",     color: "#5CBFA6" },
  { key: "Abs",        color: "#E8D830" },
  { key: "Cardio",     color: "#6FA85B" }
];

const EXERCISE_LIBRARY = {
  Chest: [
    { name: "Barbell Bench Press",        equipment: "Barbell" },
    { name: "Incline Barbell Press",       equipment: "Barbell" },
    { name: "Dumbbell Bench Press",        equipment: "Dumbbell" },
    { name: "Incline Dumbbell Press",      equipment: "Dumbbell" },
    { name: "Chest Fly (Dumbbell)",        equipment: "Dumbbell" },
    { name: "Cable Crossover",             equipment: "Cable" },
    { name: "Push-Up",                     equipment: "Bodyweight" },
    { name: "Dips (Chest Focus)",          equipment: "Bodyweight" },
    { name: "Machine Chest Press",         equipment: "Machine" },
    { name: "Pec Deck Machine",            equipment: "Machine" }
  ],
  Back: [
    { name: "Deadlift",                    equipment: "Barbell" },
    { name: "Pull-Up",                     equipment: "Bodyweight" },
    { name: "Lat Pulldown",                equipment: "Cable" },
    { name: "Barbell Row",                 equipment: "Barbell" },
    { name: "Seated Cable Row",            equipment: "Cable" },
    { name: "One-Arm Dumbbell Row",        equipment: "Dumbbell" },
    { name: "T-Bar Row",                   equipment: "Barbell" },
    { name: "Face Pull",                   equipment: "Cable" },
    { name: "Chin-Up",                     equipment: "Bodyweight" },
    { name: "Hyperextension",              equipment: "Bodyweight" }
  ],
  Shoulders: [
    { name: "Overhead Press",              equipment: "Barbell" },
    { name: "Dumbbell Shoulder Press",     equipment: "Dumbbell" },
    { name: "Lateral Raise",               equipment: "Dumbbell" },
    { name: "Front Raise",                 equipment: "Dumbbell" },
    { name: "Rear Delt Fly",               equipment: "Dumbbell" },
    { name: "Arnold Press",                equipment: "Dumbbell" },
    { name: "Cable Lateral Raise",         equipment: "Cable" },
    { name: "Upright Row",                 equipment: "Barbell" },
    { name: "Shrugs",                      equipment: "Dumbbell" }
  ],
  Biceps: [
    { name: "Barbell Curl",                equipment: "Barbell" },
    { name: "Dumbbell Curl",               equipment: "Dumbbell" },
    { name: "Hammer Curl",                 equipment: "Dumbbell" },
    { name: "Preacher Curl",               equipment: "Barbell" },
    { name: "Incline Dumbbell Curl",       equipment: "Dumbbell" },
    { name: "Cable Curl",                  equipment: "Cable" },
    { name: "Concentration Curl",          equipment: "Dumbbell" }
  ],
  Triceps: [
    { name: "Close-Grip Bench Press",      equipment: "Barbell" },
    { name: "Tricep Pushdown",             equipment: "Cable" },
    { name: "Skull Crusher",               equipment: "Barbell" },
    { name: "Overhead Tricep Extension",   equipment: "Dumbbell" },
    { name: "Dips (Triceps Focus)",        equipment: "Bodyweight" },
    { name: "Kickback",                    equipment: "Dumbbell" },
    { name: "Rope Pushdown",               equipment: "Cable" }
  ],
  Forearms: [
    { name: "Wrist Curl",                  equipment: "Barbell" },
    { name: "Reverse Wrist Curl",          equipment: "Barbell" },
    { name: "Farmer's Carry",              equipment: "Dumbbell" },
    { name: "Reverse Curl",                equipment: "Barbell" },
    { name: "Plate Pinch Hold",            equipment: "Plate" }
  ],
  Quads: [
    { name: "Back Squat",                  equipment: "Barbell" },
    { name: "Front Squat",                 equipment: "Barbell" },
    { name: "Leg Press",                   equipment: "Machine" },
    { name: "Leg Extension",               equipment: "Machine" },
    { name: "Walking Lunge",               equipment: "Dumbbell" },
    { name: "Bulgarian Split Squat",       equipment: "Dumbbell" },
    { name: "Goblet Squat",                equipment: "Dumbbell" },
    { name: "Hack Squat",                  equipment: "Machine" }
  ],
  Hamstrings: [
    { name: "Romanian Deadlift",           equipment: "Barbell" },
    { name: "Leg Curl (Lying)",            equipment: "Machine" },
    { name: "Leg Curl (Seated)",           equipment: "Machine" },
    { name: "Good Morning",                equipment: "Barbell" },
    { name: "Stiff-Leg Deadlift",          equipment: "Dumbbell" },
    { name: "Nordic Curl",                 equipment: "Bodyweight" }
  ],
  Glutes: [
    { name: "Hip Thrust",                  equipment: "Barbell" },
    { name: "Glute Bridge",                equipment: "Barbell" },
    { name: "Cable Kickback",              equipment: "Cable" },
    { name: "Sumo Deadlift",               equipment: "Barbell" },
    { name: "Step-Up",                     equipment: "Dumbbell" },
    { name: "Hip Abduction Machine",       equipment: "Machine" }
  ],
  Calves: [
    { name: "Standing Calf Raise",         equipment: "Machine" },
    { name: "Seated Calf Raise",           equipment: "Machine" },
    { name: "Donkey Calf Raise",           equipment: "Machine" },
    { name: "Single-Leg Calf Raise",       equipment: "Bodyweight" }
  ],
  Abs: [
    { name: "Hanging Leg Raise",           equipment: "Bodyweight" },
    { name: "Cable Crunch",                equipment: "Cable" },
    { name: "Plank",                       equipment: "Bodyweight" },
    { name: "Ab Wheel Rollout",            equipment: "Wheel" },
    { name: "Sit-Up",                      equipment: "Bodyweight" },
    { name: "Russian Twist",               equipment: "Bodyweight" },
    { name: "Bicycle Crunch",              equipment: "Bodyweight" }
  ],
  Cardio: [
    { name: "Treadmill Run",               equipment: "Machine" },
    { name: "Stationary Bike",             equipment: "Machine" },
    { name: "Rowing Machine",              equipment: "Machine" },
    { name: "Jump Rope",                   equipment: "Bodyweight" },
    { name: "Stair Climber",               equipment: "Machine" },
    { name: "Elliptical",                  equipment: "Machine" }
  ]
};

function getMuscleColor(muscleKey){
  const m = MUSCLE_GROUPS.find(g => g.key === muscleKey);
  return m ? m.color : "#8d8d95";
}
