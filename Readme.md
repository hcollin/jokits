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

This version introduces two new concepts to services: Status and Workers.

Status is an internal status of the service that the service can change and it will automatically trigger and ServiceStatusUpdated event. This 
functionality is mainly useful for services that work asynchronously and fetch data from apis etc.

Worker functionality on the otherhand are callbacks that can be sent with the new work() function. This worker function is received as a second argument in the eventHandler can be used to send back information that is not in the default type of the service.

* Service Status functionality
* Service Worker functionlaity


Use with jokits-react for built-in tools for state management.