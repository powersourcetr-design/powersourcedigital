# Client logos

Drop logo files straight into this folder. They appear on the next build — there
is no list to edit and no import to add.

## Naming

The filename becomes the displayed name and the alt text:

    acme-industrial.png   ->  "Acme Industrial"
    al_faisal_group.svg   ->  "Al Faisal Group"

So name the file after the client, in Latin script, lowercase, words separated
by `-` or `_`.

## Format

- **SVG** is best — sharp at any size, tiny file.
- **PNG with a transparent background** is the next best thing.
- Avoid JPGs with a white box around the mark: on a white strip the box is
  invisible, but the logo will sit in a slightly different shade and look wrong.

Anything from 200px tall upwards is plenty; the strip renders them at 28px and
Astro generates the smaller sizes.

## Before you add one

Only add a logo you have permission to display. A client list is the first thing
a serious buyer checks, and a logo used without permission is worse than an empty
strip.

Once this folder has any file in it, the strip switches from platform names to
client logos automatically.
