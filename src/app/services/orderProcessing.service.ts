import {Injectable} from "@angular/core";
import {Order} from "../common/order";
import {NumberGrouping} from "../common/numberGrouping.pipe";
import {ManagerService} from "./manager.service";

@Injectable()
export class OrderProcessingService {

  private targetSystem = "7RM";
  private margin = "10%"; // todo: remove after beta phase

  public constructor(private managerService:ManagerService) { }

  public onStatusChange(id:string, newStatus:string, orders:Array<Order>):Array<Order> {
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].id === id) {
        orders[i].status = "Updating ...";
      }
    }
    this.managerService.updateStatus(id, newStatus).subscribe(
      data => {
        for (let i = 0; i < orders.length; i++) {
          if (orders[i].id === id) {
            orders[i].status = newStatus;
          }
        }
      },
      err => {
        console.log(err);
      }
    );
    return orders;
  }

  public getRecipient(order:Order):string {
    return order.client;
  }

  public getTitle(status:string) {
    if (status === 'confirmed') {
      return "Delivery Service - Confirmed";
    } else if (status === 'rejected') {
      return "!! Delivery Service - Rejected !!";
    } else if (status === 'contracted') {
      return "Delivery Service - Contracted"
    }
  }

  public generateMail(status:string, order:Order):string {
    let result = "Hi " + order.client + "!<br><br>";

    if (status === 'confirmed') {
      result += "Thank you for your order (" + order.link + "). With a " + this.margin + " delivery fee to " + this.targetSystem + " it will cost " + new NumberGrouping().transform(order.setPrice) + ".00 ISK. Shipping will start soon!";
    } else if (status === 'rejected') {
      result += "We are sad to inform you that your order cannot be accepted. This is due to overly high shipping costs. Maybe you want to focus on importing modules and building ships locally?";
    } else if (status === 'contracted') {
      result += "Your order (" + order.link + ") has been contracted to you and costs " + new NumberGrouping().transform(order.setPrice) + ".00 ISK. Let me know when you need more!";
    }

    result += "<br><br>Cheers, Rihan";

    return result;
  }

  public getExchangeDescription(order:Order) {
    let client = order.client;
    let price = order.setPrice;
    return "To '" + client + "' for " + new NumberGrouping().transform(price) + " ISK";
  }

}