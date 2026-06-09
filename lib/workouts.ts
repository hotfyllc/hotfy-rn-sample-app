// Mock data. In a real app this would come from a backend.
// Kept inline so the sample stays trivial to clone & run.

export type Exercise = {
  name: string
  durationSec: number
}

export type Workout = {
  id: string
  title: string
  subtitle: string
  /** Total seconds, derived from exercises. */
  totalSec: number
  level: 'beginner' | 'intermediate' | 'advanced'
  /** When true, requires watching a rewarded ad to unlock. */
  premium: boolean
  exercises: Exercise[]
}

const make = (
  id: string,
  title: string,
  subtitle: string,
  level: Workout['level'],
  premium: boolean,
  exercises: Exercise[],
): Workout => ({
  id,
  title,
  subtitle,
  level,
  premium,
  exercises,
  totalSec: exercises.reduce((sum, e) => sum + e.durationSec, 0),
})

const standardSet = (...names: string[]): Exercise[] =>
  names.map((name) => ({ name, durationSec: 30 }))

export const WORKOUTS: Workout[] = [
  make('full-body-7', 'Full body 7', 'Classic 7-minute full body workout.', 'beginner', false, [
    ...standardSet(
      'Jumping jacks',
      'Wall sit',
      'Push-ups',
      'Crunches',
      'Step-up onto chair',
      'Squats',
      'Triceps dip on chair',
      'Plank',
      'High knees',
      'Lunges',
      'Push-up & rotation',
      'Side plank',
    ),
  ]),
  make('core-blast', 'Core blast', 'Tight abs in 4 minutes.', 'beginner', false, [
    ...standardSet('Crunches', 'Plank', 'Bicycle crunches', 'Russian twists', 'Mountain climbers', 'Reverse crunch', 'Side plank L', 'Side plank R'),
  ]),
  make('cardio-burn', 'Cardio burn', 'Heart-pumping interval set.', 'intermediate', false, [
    ...standardSet('High knees', 'Burpees', 'Jumping jacks', 'Mountain climbers', 'Skater jumps', 'Squat jumps', 'Butt kicks', 'Plank jacks'),
  ]),
  make('upper-body', 'Upper body', 'Push, pull and press.', 'intermediate', false, [
    ...standardSet('Push-ups', 'Triceps dip', 'Diamond push-ups', 'Pike push-ups', 'Plank to push-up', 'Arm circles', 'Shoulder taps', 'Push-up & rotation'),
  ]),
  make('lower-body', 'Lower body', 'Legs and glutes focus.', 'beginner', false, [
    ...standardSet('Squats', 'Lunges', 'Wall sit', 'Calf raises', 'Glute bridge', 'Side lunges', 'Step-ups', 'Squat jumps'),
  ]),
  make('mobility', 'Mobility flow', 'Loosen up and recover.', 'beginner', false, [
    ...standardSet("Cat-cow", "World's greatest stretch", 'Hip openers', 'Thoracic rotations', 'Hamstring scoops', 'Ankle rocks', 'Shoulder rolls', 'Deep squat hold'),
  ]),
  make('hiit-express', 'HIIT express', 'Short, brutal, effective.', 'advanced', false, [
    ...standardSet('Burpees', 'Squat jumps', 'Push-ups', 'Mountain climbers', 'Tuck jumps', 'Plank jacks', 'Skater jumps', 'Star jumps'),
  ]),
  make('elite-shred', 'Elite shred', 'Pro-level full body. Unlock to play.', 'advanced', true, [
    ...standardSet('Burpees', 'Pistol squats', 'Handstand hold', 'Plyo push-ups', 'Box jumps', 'Single-leg burpee', 'L-sit hold', 'Archer push-ups', 'Jump lunges', 'Bear crawl'),
  ]),
]

export const getWorkout = (id: string): Workout | undefined =>
  WORKOUTS.find((w) => w.id === id)

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
