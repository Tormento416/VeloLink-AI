# Point "AI Web Builder" buttons to the Demos page

## What changes
- The two price-section buttons on the Home and Packages pages (currently "Talk to a Rep", going to Contact) go back to the label **"AI Web Builder"** and open the **Demos** page instead.
- The private rep workspace stays hidden; no public link points to it.

## After this
Tell me what needs fixing on the Demos page and I'll plan that next.

## Technical details
- `src/components/site/StandaloneOffer.tsx`: both `<Link to="/contact">Talk to a Rep` become `<Link to="/demos">AI Web Builder`.
