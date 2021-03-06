import {Component, OnInit, SimpleChange} from '@angular/core';
import {Order} from "../../common/order";
import {PilotSelfService} from "../../services/pilot-self.service";
import {NumberGrouping} from "../../common/numberGrouping.pipe";
import {OrderClientFilter} from "../../common/orderClientFilter.pipe";
import {OrderDestinationFilter} from "../../common/orderDestinationFilter.pipe";
import {Router} from "@angular/router";
import {PickComponent} from "./pick/pick.component";
import {SecuredStatsService} from "../../services/secured-stats.service";
import {DataTableDirectives} from "angular2-datatable/datatable";

declare var _:any;

@Component({
  moduleId: module.id,
  selector: 'app-self-service',
  templateUrl: 'self-service.component.html',
  styleUrls: ['self-service.component.css'],
  providers: [PilotSelfService, SecuredStatsService],
  directives: [PickComponent, DataTableDirectives],
  pipes: [NumberGrouping, OrderClientFilter, OrderDestinationFilter]
})
export class SelfServiceComponent implements OnInit {

  private orders: Array<Order>;
  private destinations: Array<string>;
  private selectedDestination: string;
  private requestedValue: number;
  private requestedVolume: number;

  constructor(private pilotSelfService: PilotSelfService, private router: Router) {
  }

  ngOnInit() {
    this.pilotSelfService.getRequestedOrders().then(orders => {
      this.orders = orders;
      this.destinations = ["All destinations"].concat(this.getUniqueDestinationsFromOrders());
      this.selectedDestination = "All destinations";
      this.requestedVolume = this.getVolumeByStatus(this.orders, 'requested');
      this.requestedValue = this.getValueByStatus(this.orders, 'requested');
    });
  }

  private getUniqueDestinationsFromOrders(): Array<string> {
    return Array.from(new Set(this.orders.map(order => {
      return order.destination
    })));
  }

  getVolume(order: Order) {
    let totalVolume = 0.0;
    for (let i = 0; i < order.items.length; i++) {
      let item = order.items[i];
      totalVolume += item.quantity * item.volume;
    }
    return parseInt("" + totalVolume);
  }

  getVolumeByStatus(orders: Order[], status: string) {
    let totalVolume = 0.0;
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].status === status) {
        totalVolume += this.getVolume(orders[i]);
      }
    }
    return totalVolume;
  }

  getValueByStatus(orders: Order[], status: string) {
    let totalValue = 0.0;
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].status === status) {
        totalValue += orders[i].expectedPrice;
      }
    }
    return totalValue;
  }

  pick(orderId: string) {
    let link = ['/pilot', orderId];
    this.router.navigate(link);
  }
}
