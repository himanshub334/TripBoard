# Performance Profiling

The project uses FlatList virtualization and memoized rows/cards to reduce rendering work for long itineraries.

For a defensible benchmark:

1. Use a release build.
2. Test on a lower-end Android device.
3. Populate hundreds or thousands of activities.
4. Record baseline FPS, frame time, memory, and render counts.
5. Apply the optimization.
6. Repeat the exact same interaction.
7. Report the measured delta.

Do not fabricate a percentage for a resume. Use your actual measurement.
