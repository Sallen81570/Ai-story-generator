import { StoryDocument } from "../types";
import { createStoryFromText } from "../utils/documentParser";

const STORY_CELESTIAL_GARDEN = `
In the quiet expanse between the twilight sky and the first evening stars, there lies a garden untouched by the hurry of the waking world. Here, the air is fragrant with blooming night-jasmine and cooling lavender, swaying in a gentle, warm breeze that carries away all lingering thoughts from the day.

With every step along the smooth mossy path, a profound sense of physical relaxation descends over your shoulders and neck. You notice a glowing silver stream winding through the garden, its waters moving in a soft, rhythmic cadence that matches the slow, effortless rhythm of your breathing.

As you pause beside the water, the reflections of distant constellations shimmer gently on the surface. The night sky is vast, deep violet, and infinitely peaceful. You realize that there is nothing more that needs to be done tonight, no problems to solve, and no burdens to carry.

You find a tranquil resting place beneath an ancient cedar tree, whose branches offer shelter and quiet reassurance. The earth beneath you is soft and supportive. With each breath you inhale pure restorative stillness, and with each breath you exhale, your muscles sink deeper into serene comfort.

A warm, luminous starlight wraps around your awareness like a soft blanket. The mind softens, letting go of words, drifting peacefully into the quiet sanctuary of deep, rejuvenating slumber.
`;

const STORY_PINEAL_RESONANCE = `
Close your physical eyes and turn your inner awareness upward toward the center of your brow, into the quiet chamber of the third eye and the pineal sanctuary. In this sacred inner space, time slows to an absolute standstill.

Feel a gentle, crystalline warmth beginning to pulse at the very center of your brain. It vibrates with a pure, high-frequency harmonic, clear like the tone of a crystal singing bowl resonating across a calm ocean.

With every slow inhalation, imagine drawing pristine celestial light up through the crown of your head directly into this inner sphere. The pineal gland responds with subtle piezoelectric resonance, melting away mental chatter and opening a gateway to lucid intuition.

Ego boundaries dissolve into pure, peaceful observation. You are not the transient noise of daily thoughts; you are the silent, timeless conscious observer experiencing this profound stillness.

Surrounded by cosmic geometry and calm indigo light, your physical body remains utterly relaxed and heavy, while your inner awareness floats in serene harmony with the universal pulse. You are safe, illuminated, and resting in total peace.
`;

const STORY_MARCUS_AURELIUS = `
When you retire at the close of day, remind yourself that the day's work is finished, and nature now calls for rest. Look up at the stars and see yourself running with them, and think constantly of the changes of the elements into each other.

The mind possesses its own citadel of tranquility. External events cannot touch this quiet center unless you invite them in. Therefore, surrender the need to control the uncontrollable, and accept this hour of stillness as a necessary harmony of the cosmos.

Cast away all anxiety concerning tomorrow. The same reason and strength that guided your steps today will meet you when the sun rises again. For now, let the body sink into the earth, unburdened and quiet.

Breathe slowly and deliberately. Inhale composure, exhale all tension. The universe is change, life is opinion, and tonight, your mind chooses deep, restorative peace.
`;

const STORY_DREAM_FOREST = `
You stand at the edge of an enchanted, moonlit forest where the trees are tall, ancient, and wrapped in emerald moss. The forest floor is soft beneath your feet, carpeted with pine needles and glowing starlight blossoms that illuminate a gentle winding path.

A quiet mist drifts through the canopy, carrying the rich, comforting scent of cedarwood, rain-kissed earth, and wild mint. With every breath, your lungs fill with pure, clean tranquility, and a wave of deep calm washes through every nerve and cell.

Farther along the path, you hear the distant, soothing whisper of a gentle waterfall tumbling into a still pool. The sound is like warm brown noise, masking all external distractions and cradling your thoughts in steady, rhythmic ease.

You step into a tranquil glade where a hammock of spun silk swings between two ancient silver birches. You lie back into its welcoming embrace. The gentle sway rocks you slowly, effortlessly, into the timeless depths of restful dreams.
`;

export const PRESET_STORIES: StoryDocument[] = [
  createStoryFromText(
    "The Celestial Garden of Sleep",
    STORY_CELESTIAL_GARDEN,
    "preset",
    undefined,
    "Subliminal Studio"
  ),
  createStoryFromText(
    "Pineal Gland Resonance & Sacred Third-Eye",
    STORY_PINEAL_RESONANCE,
    "preset",
    undefined,
    "Neuro-Acoustic Sanctuary"
  ),
  createStoryFromText(
    "Marcus Aurelius: Nighttime Stoic Reflection",
    STORY_MARCUS_AURELIUS,
    "preset",
    undefined,
    "Marcus Aurelius"
  ),
  createStoryFromText(
    "The Enchanted Dream Forest",
    STORY_DREAM_FOREST,
    "preset",
    undefined,
    "Sleep Journeys"
  ),
];
