import { ProxyCreated } from "../generated/AddressBook/AddressBook"
import { Controller } from "../generated/schema"
import { Controller as ControllerContract } from '../generated/Controller/Controller'
export function handleProxyCreated(event: ProxyCreated): void {
  // createProxy is only used to  when Controller address is first created
  // so we initialize Controller entity in this event.
  let controllerEntity = new Controller('1')
  let controllerContract = ControllerContract.bind(event.params.proxy)

  controllerEntity.addressBook = controllerContract.addressbook()

  
  controllerEntity.owner = controllerContract.owner()
  controllerEntity.partialPauser = controllerContract.partialPauser()
  controllerEntity.fullPauser = controllerContract.fullPauser()
  controllerEntity.systemFullyPaused = controllerContract.systemFullyPaused()
  controllerEntity.systemPartiallyPaused = controllerContract.systemPartiallyPaused()
  controllerEntity.callRestricted = controllerContract.callRestricted();

  controllerEntity.save()
}
