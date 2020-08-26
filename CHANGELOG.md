# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.2](https://github.com/ngneat/dialog/compare/v1.0.1...v1.0.2) (2020-08-26)


### Bug Fixes

* 🐛 expose config interfaces and config to dialogs ([8e31702](https://github.com/ngneat/dialog/commit/8e317021996c32dde6f1b93d7215d9041ab111ea)), closes [#7](https://github.com/ngneat/dialog/issues/7)

### [1.0.1](https://github.com/ngneat/dialog/compare/v1.0.0...v1.0.1) (2020-07-03)


### Bug Fixes

* 🐛 fix backdrop style ([78babff](https://github.com/ngneat/dialog/commit/78babfffc813fd58270b1b370b0ffa5a6c944014))

## 1.0.0 (2020-06-30)


### Features

* 🎸 add min height support ([f4c8f12](https://github.com/ngneat/dialog/commit/f4c8f1296320c04137ecf8d54940e0b2698c27f5))
* 🎸 add x close button ([546adcc](https://github.com/ngneat/dialog/commit/546adcc84dcc24a0d32f678c13f9e0f86a597b8e))
* add dialog playground ([31fa872](https://github.com/ngneat/dialog/commit/31fa8725d2712640d972fcb47e2e47c94006d403))
* **built-ins:** add confirm, error and success ([24d4188](https://github.com/ngneat/dialog/commit/24d418852d4f3f01e3717357a84aadd5f708dc44))
* **dialog-close:** add dialog-close directive ([28d3d49](https://github.com/ngneat/dialog/commit/28d3d494090cf2542bf61078f1d0ef7c3884c3d6))
* **schematics:** ng-add schematic ([e2c3447](https://github.com/ngneat/dialog/commit/e2c344754b5664624de54fc16bb9a2a5567abef2))
* 🎸 add dialog-service and most of features ([13b8be4](https://github.com/ngneat/dialog/commit/13b8be4079b63da2475589fd1e1f5a3b1630b940))
* add beforeClose guards ([3c9333e](https://github.com/ngneat/dialog/commit/3c9333e7607fca7419970668844d9481e46c4074))
* add dialog-cmp, add hooks and pass data ([97e822a](https://github.com/ngneat/dialog/commit/97e822a8c985dee18c5c0bc41f71e1ff5984a4a6))
* add resizable option ([505b0f1](https://github.com/ngneat/dialog/commit/505b0f1fc4410fc9ca5e135d86e057e06265e117))
* allow pass an ElementRef as container ([4718c20](https://github.com/ngneat/dialog/commit/4718c2080edfc1d060cdb8970e5e7548c1102bff))
* **dialog-component:** add open animation ([2f5b9c8](https://github.com/ngneat/dialog/commit/2f5b9c88f0c591fed653652c5d52b2e9af3f1c2b))
* global config, sizes, vcr and draggable ([7a1b4ca](https://github.com/ngneat/dialog/commit/7a1b4ca09c25209a27a39dd5eab5cb52ce09032a))


### Bug Fixes

* 🐛 dialog styles ([a0dd1a3](https://github.com/ngneat/dialog/commit/a0dd1a31540e5e3d524c237ecefb5b6aed6aa20a))
* backdropClick$ is subscribable after open ([4b1e979](https://github.com/ngneat/dialog/commit/4b1e979f38ad0e5dd530fa9ff8f7b81fd52b68df))
* fullScreen is a size ([a883c8a](https://github.com/ngneat/dialog/commit/a883c8adca44b3f6844abd43de05e3af9d8cac2a))
* **built-ins:** add padding if there's title ([7868be7](https://github.com/ngneat/dialog/commit/7868be7af758b9afd1a62c8ae548a763ee88f92a))
* **built-ins:** scope styles ([7eba7ce](https://github.com/ngneat/dialog/commit/7eba7ce8d5d7a874005baadf8f7f157bdb31737d))
* **dialog-component:** bind right context ([4398651](https://github.com/ngneat/dialog/commit/43986513e34974c81f3eb86d8e84c2d91c6591a7))
* **dialog-component:** hide backdrop ([9e056c7](https://github.com/ngneat/dialog/commit/9e056c75767f2e7c7a0b07c048436a79f026efa2))
* **dialog-component:** set windowClass at host ([63ba90e](https://github.com/ngneat/dialog/commit/63ba90e3a9749deb2a1f5611b0c6096414949aa4))
* **dialog-module:** forRoot config is optional ([e9c78d1](https://github.com/ngneat/dialog/commit/e9c78d146f228c66fd06d933c08e43f2616275e7))
* **dialog-ref:** unwrap RefType ([2f23abf](https://github.com/ngneat/dialog/commit/2f23abf67643a391963d9b47ce53d948f18c2582))
* **dialog-service:** add more-general overload ([eb94617](https://github.com/ngneat/dialog/commit/eb946179f46900eda505d5278523c88bfcf5826e))
* **draggable-directive:** move marker on init ([25dc5dc](https://github.com/ngneat/dialog/commit/25dc5dc93f5e7eb7657c62b8b9678d9d53a93595))
* afterClosed$ should emit result ([4cf37f0](https://github.com/ngneat/dialog/commit/4cf37f0f8bb18aacad7b950f24ca2c936561e840))
* clean-up only references ([4a37b26](https://github.com/ngneat/dialog/commit/4a37b26eea0045f3a25aa2f16ba61b68158e1b40))
* dialog-service ([aa647b1](https://github.com/ngneat/dialog/commit/aa647b106151b749d44820c7448860c9a3f5d5d8))
* export DIALOG_DATA token ([1b266b8](https://github.com/ngneat/dialog/commit/1b266b826bc936295c7c90a9c2094c3e40f2a795))
* **dialog-module:** sizes are optional ([c8e851c](https://github.com/ngneat/dialog/commit/c8e851ce3f2fb18311b46efbcf74550f93dd6360))
* set sizes from module ([6232b7c](https://github.com/ngneat/dialog/commit/6232b7cfdf52461d86bc528bdbd6b4e48e1356c2))
* **dialog-service:** use vcr with template-ref ([a57660b](https://github.com/ngneat/dialog/commit/a57660b52d349edb2f0b2ee673de9c03f3c18b19))


### Tests

* **dialog:** improve describe ([b64ef2e](https://github.com/ngneat/dialog/commit/b64ef2e36626f852833a07e8029c32436649d390))
* add tests ([8ca14c4](https://github.com/ngneat/dialog/commit/8ca14c4465f325a281213d2829275808af567d2a))
* missing expect ([6ddfe75](https://github.com/ngneat/dialog/commit/6ddfe75c62e46e2ff72f8923f08e4f4439d4634b))
