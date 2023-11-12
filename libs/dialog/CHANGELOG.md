# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.1.1](https://github.com/ngneat/dialog/compare/v4.1.0...v4.1.1) (2023-09-11)

### Bug Fixes

- 🐛 ignore open dialogs instead of throwing an error ([6779fc4](https://github.com/ngneat/dialog/commit/6779fc4481e11ba205a612aa00c1456c888195f5))

## [4.1.0](https://github.com/ngneat/dialog/compare/v4.0.0...v4.1.0) (2023-08-02)

### Features

- **config:** split up backdrop+escape enableClose ([5d8700d](https://github.com/ngneat/dialog/commit/5d8700d2e2231760718bbad7adc11d184b756edf)), closes [#34](https://github.com/ngneat/dialog/issues/34)
- configure min-width and max-width sizes ([fb7dd0c](https://github.com/ngneat/dialog/commit/fb7dd0c10159a89d878c4c6390a0273565ad1aaa))

## [4.0.0](https://github.com/ngneat/dialog/compare/v3.6.0...v4.0.0) (2023-05-02)

### ⚠ BREAKING CHANGES

- narrow result type definition

* The `Result` generic is now infered based on the public ref property in the component
* `DialogRef.afterClosed$` will now use the infered result type
* `DialogRef.close` will now use the infered resut type
* `DialogRef.beforeClose` guard will now use the infered result type

### Features

- 🎸 add option to only enable close for last opened dialog ([dba14e8](https://github.com/ngneat/dialog/commit/dba14e835a35b8ec93320e9c22e8d113da8fa6e9)), closes [#96](https://github.com/ngneat/dialog/issues/96)

### Bug Fixes

- expose return type of dialog ref ([91a30d6](https://github.com/ngneat/dialog/commit/91a30d6dde16706625e5b5f2f88da0d2f34903ff)), closes [#86](https://github.com/ngneat/dialog/issues/86)

## [3.6.0](https://github.com/ngneat/dialog/compare/v3.5.0...v3.6.0) (2023-04-24)

### Features

- 🎸 add zIndex getter ([8d63395](https://github.com/ngneat/dialog/commit/8d63395afde5bf0b058138a10b594578ccf48f11))

## [3.5.0](https://github.com/ngneat/dialog/compare/v3.4.0...v3.5.0) (2023-02-26)

### Features

- 🎸 add CloseAllDialogsDirective ([86704d0](https://github.com/ngneat/dialog/commit/86704d0fbbc057290a62025f00b92116c83df7be))

## [3.4.0](https://github.com/ngneat/dialog/compare/v3.1.0...v3.4.0) (2023-02-23)

### Features

- 🎸 add css variables ([4e071aa](https://github.com/ngneat/dialog/commit/4e071aafaa51f65ea5bf2e6e818c1dc413a35547))
- 🎸 add more variables ([1d7ca80](https://github.com/ngneat/dialog/commit/1d7ca80387f3f2abc67b057c6782a98023484011))
- add aria role attribute to dialog component ([0733000](https://github.com/ngneat/dialog/commit/0733000065b4dcb3070411137f8cef56c3f24afe)), closes [#90](https://github.com/ngneat/dialog/issues/90)

### Bug Fixes

- 🐛 remove redundant top ([f81a9b6](https://github.com/ngneat/dialog/commit/f81a9b6bedce1689d7b4ee069f0044de4d32aa67))
- **draggable:** move target instead of handle ([490b28b](https://github.com/ngneat/dialog/commit/490b28b4e96d4f8f6da8696bce7b1ed8b3b87c8b)), closes [#84](https://github.com/ngneat/dialog/issues/84)

## [3.3.0](https://github.com/ngneat/dialog/compare/v3.2.1...v3.3.0) (2023-01-05)

### Features

- 🎸 add more variables ([b2be840](https://github.com/ngneat/dialog/commit/b2be840f6d224c318d080d3f5f9c42484ffcc5f1))

### [3.2.1](https://github.com/ngneat/dialog/compare/v3.2.0...v3.2.1) (2023-01-05)

### Bug Fixes

- 🐛 remove redundant top ([42638bb](https://github.com/ngneat/dialog/commit/42638bbfdaae30c0a66715e4ad80906b4733f1a8))

## [3.2.0](https://github.com/ngneat/dialog/compare/v3.1.0...v3.2.0) (2023-01-05)

### Features

- 🎸 add css variables ([6a6c334](https://github.com/ngneat/dialog/commit/6a6c3346a1c0b2bd3441651c4c7cc71539062307))

## [3.1.0](https://github.com/ngneat/dialog/compare/v3.0.2...v3.1.0) (2023-01-01)

### Features

- 🎸 expose dialog open statuses ([030a68d](https://github.com/ngneat/dialog/commit/030a68de9d3a4295a66e33e76d77b51555140b34))

### [3.0.2](https://github.com/ngneat/dialog/compare/v3.0.1...v3.0.2) (2022-12-12)

### Bug Fixes

- 🐛 allow nullable values ([59cb603](https://github.com/ngneat/dialog/commit/59cb603d5b009678b7e6d0697b18d2717151355e)), closes [#81](https://github.com/ngneat/dialog/issues/81)

### [3.0.1](https://github.com/ngneat/dialog/compare/v2.1.1...v3.0.1) (2022-12-04)

### ⚠ BREAKING CHANGES

- upgrade to standalone components

* Remove `DialogModule`
* Remove built-in dialogs
* Sizes default `height` is now `auto`
* Expose `provideDialogConfig` function
* `dialogClose` should be imported when used
* The `data` property type now inferred based on the public ref property in the component (see docs)

### Features

- customize confirm and cancel button texts of built-in dialogs ([a7eab24](https://github.com/ngneat/dialog/commit/a7eab2423ad41bcb3e2a32ece9a332c5e3381812)), closes [#47](https://github.com/ngneat/dialog/issues/47) [#62](https://github.com/ngneat/dialog/issues/62)
- upgrade to standalone components ([f5575f5](https://github.com/ngneat/dialog/commit/f5575f59da2fb61b9c0aa229e8890eaf32a2a56c))

### Bug Fixes

- 🐛 fix types ([27c2621](https://github.com/ngneat/dialog/commit/27c2621127286c5ae24f2b361e07ea20d02faa18))
- add reset location dialog component for demo ([266a9eb](https://github.com/ngneat/dialog/commit/266a9ebd30de438a3888fe3f558baa69768007b3))

### Build System

- fix the build script and add build test to ci ([3f1f280](https://github.com/ngneat/dialog/commit/3f1f280e1610ce4da4fdc1b7b9a8c8a1c4122ddb))

## [3.0.0](https://github.com/ngneat/dialog/compare/v2.1.1...v3.0.0) (2022-11-24)

### ⚠ BREAKING CHANGES

- upgrade to standalone components

* Remove `DialogModule`
* Remove built-in dialogs
* Sizes default `height` is now `auto`
* Expose `provideDialogConfig` function
* `dialogClose` should be imported when used
* The `data` property type now infered based on the public ref property in the component (see docs)

### Bug Fixes

- add reset location dialog component for demo ([266a9eb](https://github.com/ngneat/dialog/commit/266a9ebd30de438a3888fe3f558baa69768007b3))

### Build System

- fix the build script and add build test to ci ([3f1f280](https://github.com/ngneat/dialog/commit/3f1f280e1610ce4da4fdc1b7b9a8c8a1c4122ddb))

### [2.1.1](https://github.com/ngneat/dialog/compare/v2.1.0...v2.1.1) (2022-06-14)

### Bug Fixes

- pass through offset parameters to resetDrag method ([2fde3d1](https://github.com/ngneat/dialog/commit/2fde3d14ebc30461254e85d91a485ee3f8ca8e23))
- **dialog-service:** dialog invalid id ([2722393](https://github.com/ngneat/dialog/commit/2722393228016eb412e8638eaf731fe22e16d64c)), closes [#63](https://github.com/ngneat/dialog/issues/63)

## [2.1.0](https://github.com/ngneat/dialog/compare/v2.0.1...v2.1.0) (2022-03-31)

### Features

- add dialog strict typings [#54](https://github.com/ngneat/dialog/issues/54) ([b011c9f](https://github.com/ngneat/dialog/commit/b011c9f986d7310a55efe256bc481ea67292f80f))

### Bug Fixes

- fix dialog open config param default parameter ([207cdf2](https://github.com/ngneat/dialog/commit/207cdf2496cc6c8f16da52047165c58edef84337))
- fix dialog service open return typings ([2e7b93f](https://github.com/ngneat/dialog/commit/2e7b93fe195b57933af0599266d77e28cadf5626))

### Tests

- fix dialog.service.spec.ts type error ([3f9791c](https://github.com/ngneat/dialog/commit/3f9791c0fb874d267ad4f66c81c3c1201dab5692))

### [2.0.1](https://github.com/ngneat/dialog/compare/v2.0.0...v2.0.1) (2022-01-04)

### Bug Fixes

- 🐛 clicking on element with ngIf closes the dialog ([490ab3d](https://github.com/ngneat/dialog/commit/490ab3dce0a7a0b0c6df0b17101b017588d887b6))

## [2.0.0](https://github.com/ngneat/dialog/compare/v1.7.0...v2.0.0) (2021-11-24)

### ⚠ BREAKING CHANGES

- Peer dep of v13

### Features

- 🎸 angular v13 ([b810c16](https://github.com/ngneat/dialog/commit/b810c16ff234a52be67a0165ec5b1d415a17ce6f))

## [1.7.0](https://github.com/ngneat/dialog/compare/v1.6.0...v1.7.0) (2021-10-18)

### Features

- add drag constraint and reset methods ([feb39c4](https://github.com/ngneat/dialog/commit/feb39c4a4231834dd91bfbc9eb9fd16f33ee2a34)), closes [#36](https://github.com/ngneat/dialog/issues/36)
- closeButton without backdrop click close ([94e52e8](https://github.com/ngneat/dialog/commit/94e52e8401e7b28c39b28e955bb378ec73ed150b))
- move options to the global config ([0a0c5c6](https://github.com/ngneat/dialog/commit/0a0c5c68fddac185419d6b062f0a9cfa34944a58)), closes [#37](https://github.com/ngneat/dialog/issues/37)

## [1.6.0](https://github.com/ngneat/dialog/compare/v1.5.0...v1.6.0) (2021-03-21)

### Features

- allow multiple classes to be set from windowClass ([5ac3297](https://github.com/ngneat/dialog/commit/5ac3297fb664c4cd104b00648ebe21f09df55e72))
- allow multiple classes to be set from windowClass ([d60ee41](https://github.com/ngneat/dialog/commit/d60ee4142436137e2d0c6ce2f75848796e8b717b))

## [1.5.0](https://github.com/ngneat/dialog/compare/v1.4.1...v1.5.0) (2021-03-16)

### Features

- add closeAll to dialog service ([fa8cb92](https://github.com/ngneat/dialog/commit/fa8cb9272ce0a3ec00209b1d2b085a991e18c261)), closes [#23](https://github.com/ngneat/dialog/issues/23)

### Bug Fixes

- **dialog-service:** Remove 'ngneat-dialog-hidden' from body only after last dialog is closed ([83477dd](https://github.com/ngneat/dialog/commit/83477dd0d697d989eda2930214b265bd190b46e8)), closes [ngneat/dialog#26](https://github.com/ngneat/dialog/issues/26)
- close dialog on backdrop click ([efbdb11](https://github.com/ngneat/dialog/commit/efbdb112b613240d8a97cf7be0aa6a4ca6700efb))
- **schematics:** use correct folder ([6e52e31](https://github.com/ngneat/dialog/commit/6e52e312f2130be8f87003766c7d77aff6044b79))

### [1.4.1](https://github.com/ngneat/dialog/compare/v1.4.0...v1.4.1) (2021-02-02)

### Bug Fixes

- 🐛 replace close icon ([b747695](https://github.com/ngneat/dialog/commit/b7476951280c4b0620557d5cbb8e0809fa271453))

## [1.4.0](https://github.com/ngneat/dialog/compare/v1.3.0...v1.4.0) (2021-01-26)

### Features

- 🎸 support custom sizes ([66e90ad](https://github.com/ngneat/dialog/commit/66e90ad9a35247615b99489a2022ab18719b423d))

### Bug Fixes

- 🐛 set deafult modal size to md ([fc9c79a](https://github.com/ngneat/dialog/commit/fc9c79ac8e8b1113750dee5676727f017356678d))

## [1.3.0](https://github.com/ngneat/dialog/compare/v1.0.4...v1.3.0) (2021-01-26)

### Features

- 🎸 add max height to config ([d2f57ea](https://github.com/ngneat/dialog/commit/d2f57eabf6e6844c727b0ce81e2008c0cf93dd6b))

### Bug Fixes

- **dialog-component:** use appendChild instead of append (IE) ([e4e56e2](https://github.com/ngneat/dialog/commit/e4e56e2b56b71b7656eb81d2b0e050cb762a24a7))

### [1.2.1](https://github.com/ngneat/dialog/compare/v1.2.0...v1.2.1) (2020-12-01)

### Bug Fixes

- 🐛 fix position ([88442d7](https://github.com/ngneat/dialog/commit/88442d756aeb784b29ed29df0a5977c0fe012eb9))

## [1.2.0](https://github.com/ngneat/dialog/compare/v1.1.0...v1.2.0) (2020-12-01)

### Features

- 🎸 add onopen and onclose to global config ([cfc68ba](https://github.com/ngneat/dialog/commit/cfc68ba18285a49c1771174f33dc3f2a507b645b))

### Bug Fixes

- 🐛 change modal animation ([65c6d85](https://github.com/ngneat/dialog/commit/65c6d85f9a61f72fddede5b2c93c188738617277))

### [1.0.4](https://github.com/ngneat/dialog/compare/v1.1.1...v1.0.4) (2020-12-19)

### Bug Fixes

- provide default value in forRoot() method ([4ccc22d](https://github.com/ngneat/dialog/commit/4ccc22d025dc6060272af7556f29dd84b7aac005))

### [1.0.3](https://github.com/ngneat/dialog/compare/v1.0.2...v1.0.3) (2020-11-05)

### Bug Fixes

- 🐛 add dialog comp to entry ([3674346](https://github.com/ngneat/dialog/commit/3674346f3520ef127bed9e922297e62bce1c84da))

### [1.0.2](https://github.com/ngneat/dialog/compare/v1.0.1...v1.0.2) (2020-08-26)

### Bug Fixes

- 🐛 expose config interfaces and config to dialogs ([8e31702](https://github.com/ngneat/dialog/commit/8e317021996c32dde6f1b93d7215d9041ab111ea)), closes [#7](https://github.com/ngneat/dialog/issues/7)

### [1.0.1](https://github.com/ngneat/dialog/compare/v1.0.0...v1.0.1) (2020-07-03)

### Bug Fixes

- 🐛 fix backdrop style ([78babff](https://github.com/ngneat/dialog/commit/78babfffc813fd58270b1b370b0ffa5a6c944014))

## 1.0.0 (2020-06-30)

### Features

- 🎸 add min height support ([f4c8f12](https://github.com/ngneat/dialog/commit/f4c8f1296320c04137ecf8d54940e0b2698c27f5))
- 🎸 add x close button ([546adcc](https://github.com/ngneat/dialog/commit/546adcc84dcc24a0d32f678c13f9e0f86a597b8e))
- add dialog playground ([31fa872](https://github.com/ngneat/dialog/commit/31fa8725d2712640d972fcb47e2e47c94006d403))
- **built-ins:** add confirm, error and success ([24d4188](https://github.com/ngneat/dialog/commit/24d418852d4f3f01e3717357a84aadd5f708dc44))
- **dialog-close:** add dialog-close directive ([28d3d49](https://github.com/ngneat/dialog/commit/28d3d494090cf2542bf61078f1d0ef7c3884c3d6))
- **schematics:** ng-add schematic ([e2c3447](https://github.com/ngneat/dialog/commit/e2c344754b5664624de54fc16bb9a2a5567abef2))
- 🎸 add dialog-service and most of features ([13b8be4](https://github.com/ngneat/dialog/commit/13b8be4079b63da2475589fd1e1f5a3b1630b940))
- add beforeClose guards ([3c9333e](https://github.com/ngneat/dialog/commit/3c9333e7607fca7419970668844d9481e46c4074))
- add dialog-cmp, add hooks and pass data ([97e822a](https://github.com/ngneat/dialog/commit/97e822a8c985dee18c5c0bc41f71e1ff5984a4a6))
- add resizable option ([505b0f1](https://github.com/ngneat/dialog/commit/505b0f1fc4410fc9ca5e135d86e057e06265e117))
- allow pass an ElementRef as container ([4718c20](https://github.com/ngneat/dialog/commit/4718c2080edfc1d060cdb8970e5e7548c1102bff))
- **dialog-component:** add open animation ([2f5b9c8](https://github.com/ngneat/dialog/commit/2f5b9c88f0c591fed653652c5d52b2e9af3f1c2b))
- global config, sizes, vcr and draggable ([7a1b4ca](https://github.com/ngneat/dialog/commit/7a1b4ca09c25209a27a39dd5eab5cb52ce09032a))

### Bug Fixes

- 🐛 dialog styles ([a0dd1a3](https://github.com/ngneat/dialog/commit/a0dd1a31540e5e3d524c237ecefb5b6aed6aa20a))
- backdropClick\$ is subscribable after open ([4b1e979](https://github.com/ngneat/dialog/commit/4b1e979f38ad0e5dd530fa9ff8f7b81fd52b68df))
- fullScreen is a size ([a883c8a](https://github.com/ngneat/dialog/commit/a883c8adca44b3f6844abd43de05e3af9d8cac2a))
- **built-ins:** add padding if there's title ([7868be7](https://github.com/ngneat/dialog/commit/7868be7af758b9afd1a62c8ae548a763ee88f92a))
- **built-ins:** scope styles ([7eba7ce](https://github.com/ngneat/dialog/commit/7eba7ce8d5d7a874005baadf8f7f157bdb31737d))
- **dialog-component:** bind right context ([4398651](https://github.com/ngneat/dialog/commit/43986513e34974c81f3eb86d8e84c2d91c6591a7))
- **dialog-component:** hide backdrop ([9e056c7](https://github.com/ngneat/dialog/commit/9e056c75767f2e7c7a0b07c048436a79f026efa2))
- **dialog-component:** set windowClass at host ([63ba90e](https://github.com/ngneat/dialog/commit/63ba90e3a9749deb2a1f5611b0c6096414949aa4))
- **dialog-module:** forRoot config is optional ([e9c78d1](https://github.com/ngneat/dialog/commit/e9c78d146f228c66fd06d933c08e43f2616275e7))
- **dialog-ref:** unwrap RefType ([2f23abf](https://github.com/ngneat/dialog/commit/2f23abf67643a391963d9b47ce53d948f18c2582))
- **dialog-service:** add more-general overload ([eb94617](https://github.com/ngneat/dialog/commit/eb946179f46900eda505d5278523c88bfcf5826e))
- **draggable-directive:** move marker on init ([25dc5dc](https://github.com/ngneat/dialog/commit/25dc5dc93f5e7eb7657c62b8b9678d9d53a93595))
- afterClosed\$ should emit result ([4cf37f0](https://github.com/ngneat/dialog/commit/4cf37f0f8bb18aacad7b950f24ca2c936561e840))
- clean-up only references ([4a37b26](https://github.com/ngneat/dialog/commit/4a37b26eea0045f3a25aa2f16ba61b68158e1b40))
- dialog-service ([aa647b1](https://github.com/ngneat/dialog/commit/aa647b106151b749d44820c7448860c9a3f5d5d8))
- export DIALOG_DATA token ([1b266b8](https://github.com/ngneat/dialog/commit/1b266b826bc936295c7c90a9c2094c3e40f2a795))
- **dialog-module:** sizes are optional ([c8e851c](https://github.com/ngneat/dialog/commit/c8e851ce3f2fb18311b46efbcf74550f93dd6360))
- set sizes from module ([6232b7c](https://github.com/ngneat/dialog/commit/6232b7cfdf52461d86bc528bdbd6b4e48e1356c2))
- **dialog-service:** use vcr with template-ref ([a57660b](https://github.com/ngneat/dialog/commit/a57660b52d349edb2f0b2ee673de9c03f3c18b19))

### Tests

- **dialog:** improve describe ([b64ef2e](https://github.com/ngneat/dialog/commit/b64ef2e36626f852833a07e8029c32436649d390))
- add tests ([8ca14c4](https://github.com/ngneat/dialog/commit/8ca14c4465f325a281213d2829275808af567d2a))
- missing expect ([6ddfe75](https://github.com/ngneat/dialog/commit/6ddfe75c62e46e2ff72f8923f08e4f4439d4634b))
