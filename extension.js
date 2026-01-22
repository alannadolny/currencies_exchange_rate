/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GObject from "gi://GObject";
import St from "gi://St";
import Clutter from "gi://Clutter";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import ApiClient from "./api.js";
import { getToday, getYesterday, formatRate, getTrendArrow } from "./utils.js";

const ExchangeRate = GObject.registerClass(
  class Rate extends PanelMenu.Button {
    _init() {
      super._init(0.0, "Currencies exchange rate");
      this._api = new ApiClient();

      this._item = new PopupMenu.PopupMenuItem("Loading...");

      this._box = new St.BoxLayout({ vertical: false });

      this.baseCurrency = "USD";
      this.targetCurrency = "PLN";

      this.add_child(this._box);

      this._rateLabel();

      this._trendIcon();

      this._box.add_child(this._rateLabel);
      this._box.add_child(this._icon);

      this.menu.addMenuItem(this._item);

      this._changeCurrencyDropdowns();

      this._loadData();
    }

    _loadData() {
      Promise.all([
        this._api.fetchRate(this.baseCurrency, this.targetCurrency),
        this._api.fetchRate(
          this.baseCurrency,
          this.targetCurrency,
          getYesterday()
        ),
      ])
        .then(([currentExchangeRate, previousExchangeRate]) => {
          this._rateLabel.set_text(
            formatRate(
              currentExchangeRate,
              this.baseCurrency,
              this.targetCurrency
            )
          );

          const trendArrow = getTrendArrow(
            currentExchangeRate,
            previousExchangeRate
          );
          this._icon.set_text(trendArrow);

          const message = `(${getToday()}) Current exchange rate: ${formatRate(
            currentExchangeRate,
            this.baseCurrency,
            this.targetCurrency
          )}\n(${getYesterday()}) Yesterday's exchange rate: ${formatRate(
            previousExchangeRate,
            this.baseCurrency,
            this.targetCurrency
          )}`;
          this._item.label.set_text(message);
        })
        .catch((e) => {
          this._rateLabel.set_text("Error");
          this._item.label.set_text("Error fetching rate");
        });
    }

    _trendIcon() {
      this._icon = new St.Label({
        text: "→",
        y_align: Clutter.ActorAlign.CENTER,
        style_class: "system-status-icon unicode-arrow",
      });
    }

    _rateLabel() {
      this._rateLabel = new St.Label({
        text: "Loading...",
        y_align: Clutter.ActorAlign.CENTER,
        style_class: "exchange-rate-label",
      });
    }

    _showLoading() {
      this._rateLabel.set_text("Loading...");
    }

    _changeCurrencyDropdowns() {
      this._changeBaseCurrencyButton = new PopupMenu.PopupSubMenuMenuItem(
        "Change Base Currency"
      );

      this._changeTargetCurrencyButton = new PopupMenu.PopupSubMenuMenuItem(
        "Change Target Currency"
      );

      const CURRENCIES = [
        "PLN",
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "CAD",
        "CHF",
        "RUB",
        "NOK",
      ];

      CURRENCIES.forEach((currency) => {
        const baseItem = new PopupMenu.PopupMenuItem(currency);
        baseItem.connect("activate", () => {
          this._addBaseCurrencyOption(currency);
        });
        this._changeBaseCurrencyButton.menu.addMenuItem(baseItem);

        const targetItem = new PopupMenu.PopupMenuItem(currency);
        targetItem.connect("activate", () => {
          this._addTargetCurrencyOption(currency);
        });
        this._changeTargetCurrencyButton.menu.addMenuItem(targetItem);
      });

      this.menu.addMenuItem(this._changeBaseCurrencyButton);
      this.menu.addMenuItem(this._changeTargetCurrencyButton);
    }

    _addBaseCurrencyOption(currency) {
      this.baseCurrency = currency;
      this._showLoading();
      this._loadData();
    }

    _addTargetCurrencyOption(currency) {
      this.targetCurrency = currency;
      this._showLoading();
      this._loadData();
    }

    destroy() {
      if (this._api) {
        this._api.destroy();
      }

      super.destroy();
    }
  }
);

export default class CurrenciesExchangeRateExtension extends Extension {
  enable() {
    this._exchangeRate = new ExchangeRate();
    Main.panel.addToStatusArea(this.uuid, this._exchangeRate);
  }

  disable() {
    this._exchangeRate.destroy();
    this._exchangeRate = null;
  }
}
