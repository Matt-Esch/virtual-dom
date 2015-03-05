# Release Notes

## v2.0.0

  Provides fundamental fixes and tests for reordering of keyed nodes.

  Everyone is encouraged to upgrade to v2. The main caveat of this upgrade
  is that it changes the patch format to encode all of the move data,
  instead of previously providing the mapping and expecting patch to work
  out which moves are required. While this might limit options for
  reordering, on the grounds of performance and debugging it made more
  sense.

  This is considered a breaking change for that reason. However, for those
  of you who only consume `create`, `diff`, `patch` and `h`, this will
  not affect your usage, and upgrading is recommended due to the bugs this
  new version fixes.

## v1.3.0

  - Add optimization to AttributHook to prevent resetting attributes where
    new hook instances are used but their values remain the same.

  - Extend the interface of unhook to take the next value from diff.

  - Fix bug where hook is called on unhook-only hooks.

  - Code refactor: diffProps broken out into it's own file

## v1.2.0

  - Correctly sets SVG attributes that are namespaced using a (fixed)
    attribute hook.

  - Add CSS animation notes from github issue (css-animations.md)

  - A hook with an `unhook` method and no `hook` method is now considered a
    valid hook.

  - Fixes issue where unhook was not called when a hook property is replaced
    with a new value

  - Fixes dist script update

  - Update README to note that an instance of `dom-delegator` is required to
    use the `ev-*` properties.

## v1.1.0 - Element reordering

  - Updates the way in which elements are reordered to increase performance
    in common use cases.

  - Adds additional SVG display attributes.

# v1.0.0 - Sensible versioning begins

# v0.0.24 - Fix destroy ordering

  - Fixes a bug where widgets cannot be replaced by vnodes due to a bug in the
    order of destroy patches.

# v0.0.23 - Release notes begin
