# Contributing guidelines

## Identifying a problem

1. If you notice something that should be fixed or could be improved, please create an issue. This could be related to the library or to documentation.

## Making a change

1. Branch off of `master`.
2. Name the branch something meaningful and short. Consider prefixing the branch name with `feature/`, `fix/`, or `docs/` to help clarify the area and scope of work.
3. Commit work to the branch.
4. Add an appropriate copyright notice to source files, following the [IU Open Source Guidelines](https://indiana-university.github.io/).
5. Explain the change in the affected `CHANGELOG` file, categorizing it as patch, minor, or major changes (following [semver conventions](https://semver.org/)).
6. Submit a pull request for the branch to be merged into `master`.
7. Tag the pull request and related issues with the `Next` milestone.
8. Mention any related issues in the pull request.
9. Once the pull request is approved, merge it to `master` with the **Squash and merge** setting.
10. Delete the original branch.

## Publishing releases

1. Commit all work into master, including updating the version number in `package.json`.
2. Ensure a publish date and the new version numbers are mentioned in the `CHANGELOG` files.
3. Only what is in `master` will be published.
4. Ensure the bundles are built. `npm run start`
5. Use the Lerna wizard to confirm which packages should be published and what version numbers they will be bumped to. Each package can be versioned separately, and not all packages need to be published at once. `npm run publish`
6. Confirm that the package is available through npm, the repo is tagged, and the packages have new version numbers.
7. Rename the milestone from `Next` to whatever the published version number is. Give it a short, meaningful description. Close the milestone.
8. Create a new milestone called `Next`.
