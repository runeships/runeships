-- Replace the Godly onboarding-critique placeholder with a marketing
-- video creative brief targeting the (fictional) Gen Z daily rituals
-- app. Tilted hard toward Creativity + Communication because the
-- deliverable is brand-aligned craft, not analytical depth.
--
-- Originally specced as migration 015 — slot taken by the
-- user_aggregates RPC migration. This is 021.
--
-- The slug intentionally stays as 'onboarding-critique' because 6
-- seed submissions already point at this task id; the safety rule
-- (matching the Veganuño + myOrbit task swaps) keeps the slug when
-- submissions exist so old URLs continue to resolve. Only the
-- content + scoring shape change.
--
-- Run AFTER 020.

update public.tasks
set
  title = 'Marketing video: create a 30-60 second ad for the Godly app',
  brief = $brief$# Marketing video — Godly app

Godly is a daily rituals app for Gen Z. Track micro-habits, complete morning and evening routines, build streaks, share aesthetic moments with friends. Think *Strava for self-care*, but quieter — focused on the small consistent acts that compound into a life you actually want to live.

## About Godly

**The app.** Godly opens to your "daily altar" — a soft, scrollable view of today's intentions: drink water, journal three lines, stretch for five minutes, send a message to someone you love. Users tap each ritual as complete. Streaks build. The longer you keep showing up for yourself, the more the app rewards you with subtle aesthetic upgrades — new color palettes, ambient soundscapes, animation styles.

**The vibe.** Ethereal. Minimal. Soft pastels — cream, sage, dusty rose, lavender. Serif typography paired with airy sans. Slow-motion footage of light through curtains, hands wrapped around a ceramic mug, journal pages turning, a single match being lit. Sound design: ambient, breathy, undercurrents of birdsong or rain. The deliberate opposite of the chaotic dopamine app design that dominates the App Store.

**The target user.** Primarily women aged 18-26 — college students, recent grads, early-career professionals. They follow aesthetic lifestyle accounts on Instagram. They drink matcha. They keep a paper journal. They've tried meditation apps and found them too clinical. They want their phone to feel less like a slot machine and more like a sanctuary.

**Competitors.** Finch (cute but childish), Stoic (too austere), Co-Star (astrology, adjacent space), BeReal (daily-prompt format), Strava (streak mechanic). Godly is different from all of them in being explicitly aesthetic-first — the UI is the product as much as the functionality is.

**Tagline.** *Live godly. Daily.*

## Your task

Create a marketing video for Godly. Target length: **30-60 seconds** (sweet spot 35-45). The deliverable should be the kind of video Godly would post as a paid ad on Instagram Reels and TikTok to acquire new users.

### What it must do

- **Hook in the first three seconds.** A scroll-stopper. Without sound, without context, the viewer should want to keep watching.
- **Communicate what Godly is.** By the end of the video, a first-time viewer should understand that this is a daily rituals app and roughly how it works.
- **Show the product.** UI must appear at least once — either as screen recordings of mocked-up screens (you can build them in Figma, Canva, or any UI mockup tool) or composited into live-action footage. We don't need pixel-perfect interface design; we need enough to communicate "there is an app here."
- **Land the vibe.** This is the hardest part and the highest-weighted criterion. The video must feel cohesively *Godly* — like a faithful extension of the brand description above. If we paused any single frame, it should feel intentional.
- **End with a call to action.** Something simple. "Download Godly" with a wordmark on screen, optionally with a release timing or App Store/Google Play indication.

### What it can be

- A live-action narrative — a day in the life of someone using Godly
- A montage of aesthetic moments interspersed with UI shots
- A voiceover essay over flowing visuals
- A purely visual piece carried by music and on-screen text
- A surreal, dreamlike piece that doesn't follow conventional ad structure
- Something experimental we haven't thought of

### What it cannot be

- Generic "lifestyle app" pablum that could be selling any of two hundred different apps
- Shaky, badly framed, or technically broken footage
- Stock music that fights the brand (upbeat corporate hip-hop, EDM, "epic" trailer music)
- Longer than 60 seconds or shorter than 25
- Pure UI screen recording with no atmospheric content
- Anything that feels like an exercise. It should feel like a real ad.

### Sourcing footage

You don't need to film original footage. Acceptable sources:

- Stock footage from **Pexels**, **Unsplash Videos**, **Mixkit**, **Coverr** (all free)
- AI-generated visuals (Runway, Sora, Kling, Pika) — if cohesive and high quality
- Your own footage shot on iPhone, color-graded and edited
- Composited UI mockups over any of the above
- Royalty-free music from **Pixabay**, **Free Music Archive**, **YouTube Audio Library**, or paid sources (Artlist, Musicbed) if you have access

If you use AI-generated content, that's fine — but mention it in your submission notes. We're not testing whether you can hold a camera; we're testing whether you can produce a coherent piece of marketing.

## Specs

- **Length.** 30-60 seconds (35-45 sweet spot)
- **Aspect ratio.** 9:16 vertical (TikTok/Reels). Optional second version in 1:1 or 16:9 is welcome but not required.
- **Resolution.** 1080 × 1920 minimum
- **Audio.** Must have intentional audio. Music, voiceover, ambient sound — whichever, but it must feel *chosen*, not defaulted to a stock track because you didn't know what else to use.
- **Branding.** Use "Godly" as the wordmark. We don't have an official logo lockup — design something simple yourself in keeping with the brand description above.

## How we evaluate

- **Hook strength.** Does the first three seconds compel us to keep watching?
- **Brand alignment.** Does the video feel like Godly, not a generic wellness app?
- **Story clarity.** By the end, do we understand what Godly is and roughly what it does?
- **Production polish.** Editing, pacing, transitions, audio mix, color treatment — is the craft visible?
- **Originality.** Did you bring an angle we wouldn't have predicted? Did you avoid the obvious cliché (woman doing yoga at sunrise, hands writing in journal, cup of matcha) — or use the cliché knowingly and well?

## Submission

Upload your video to one of:

- **YouTube** (unlisted is fine — submit the unlisted link)
- **Vimeo** (public or unlisted)
- **Google Drive** or **Dropbox** with sharing enabled to "anyone with the link"

Submit the link in the field below. **Verify the link is viewable without login** by opening it in an incognito tab. A video we can't watch is a video that didn't get evaluated.

If you produced multiple aspect ratios or versions, share the primary 9:16 version and link the others in your submission notes.

Estimated time: 4-8 hours. The bulk is creative — concepting, sourcing, editing. Actual render time is small.$brief$,
  submission_mode = 'link_only',
  category = 'design',
  weight_strategy = 0.15,
  weight_execution = 0.20,
  weight_communication = 0.25,
  weight_technical = 0.10,
  weight_creativity = 0.30,
  estimated_time = '4-8 hours'
where slug = 'onboarding-critique';
