# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

## [1.0.0] - 2026-08-20

### Added

- chore: Adding README to the project
- ci: adding CI pipeline & scripts for : compiling, badges, publish npm & github packages and making releases + parameting dependabot
- chore: Adding LICENSE
- chore: adding .gitignore
- chore: adding file rules for editor and git
- chore: adding prettier config files
- chore: adding linter config files
- feat: adding J2OCL scalar & array types compatible with their counterpart in OpenCL
- feat: adding intrinsics functions (getGlobalId for now)
- feat: adding J2OCL @kernel decorator compatible with current & legacy decorators
- feat: adding Adapter Design Pattern to create an interface between J2OCL and the futur C/C++ bindings allowing J2OCL to execute OpenCL code directly from NodeJS
- feat: adding node3D-OpenCL library and README acknowledgement to its author
- feat: agnostic provider for the provider, allows the dev to prepare a kernel, execute it and retrieve the data without ever touching the native bindings
- feat: adding export barrels for the library + adding the run kernel function that executes the compiled OpenCL kernel written in C
- feat: adding ast-c the AST representation of the C code -> Last Step before being printed into C code -> Last node in the Compiler chain
- feat: Adding the IR (Intermediate Representation), neutral interface between the TS AST & the C AST
- feat: add compiler lookup utilities (symbol resolution, operator mapping, type mapping, lowering anchors)
- feat: add kernel detection contract types (KernelDescriptor, KernelParameter, KernelAnchors)
- feat: add compiler lowering stage (TypeScript kernel bodies -> IR), first Step in converting Typescript into OpenCL C code
- feat: Adding emit & print, responsible of converting the AST-C into a source version in C
- feat: add compileKernel, the compiler public entry point (lowering -> emit -> print)
- feat: expose compileKernel as the public surface of compiler/
- feat: adding anchor resolution, maps consumer type declaration to J2OCL types
- feat: add kernel detection, walks the program, validates the kernel members and the usage
- feat: add the j2ocl build CLI entry point functions
- feat: adding the barrel for the detect kernel function to make it public entry
- feat: wire up a working install/build/typecheck/lint toolchain (tests intentionally excluded for now)
- chore: formatting src/
- feat: add the test suite

### Changed

### Fixed

- fix: fixing import route

### Removed
