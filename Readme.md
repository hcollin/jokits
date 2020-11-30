# JOKI TypeScript Edition

A toolbox for event driven state management in TypeScript applications

This box includes the following parts:

* PubSub events
  * Trigger events, listen to them once or until unsubscribed
* Services
  * Targeted stateful singleton style object instance that can be a target of events and send updates (Kinda like a store)
* State Machine
  * A simple state machine that can be used to track the application state
* Atoms
  * "Global" variables that can be subsribed to.

## Version history

### 0.5.0

Introduces the status to Services. This is an internal status enum that can be used to for example async processing

* Service Status functionality
* 


Use with jokits-react for built-in tools for state management.