import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { UserDataProvider } from '@providers/user-data/user-data';
import { PrivateKey } from 'ark-ts/core';
import bip39 from 'bip39';
import { WalletKeys, AccountBackup } from '@models/model';

@IonicPage()
@Component({
  selector: 'modal-wallet-backup',
  templateUrl: 'wallet-backup.html',
})
export class WalletBackupModal {

  public title: string;
  public entropy: string;
  public keys: WalletKeys;
  public message: string;
  public showAdvancedOptions: boolean = false;

  public account: AccountBackup;

  private currentNetwork;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private userDataProvider: UserDataProvider,
  ) {
    this.title = this.navParams.get('title');
    this.entropy = this.navParams.get('entropy');
    this.keys = this.navParams.get('keys');
    this.message = this.navParams.get('message');

    if (!this.title || (!this.entropy && !this.keys)) this.dismiss();

    this.currentNetwork = this.userDataProvider.currentNetwork;
  }

  next() {
    this.dismiss(this.account);
  }

  dismiss(result?: any) {
    this.viewCtrl.dismiss(result);
  }

  toggleAdvanced() {
    this.showAdvancedOptions = !this.showAdvancedOptions;
  }

  ionViewDidLoad() {
    if (this.keys) {
      return this.generateAccountFromKeys();
    }

    this.generateAccountFromEntropy();
  }

  private generateAccountFromKeys() {
    let pvKey = PrivateKey.fromSeed(this.keys.key, this.currentNetwork);
    let pbKey = pvKey.getPublicKey();
    pbKey.setNetwork(this.currentNetwork);

    let wallet = this.userDataProvider.getWalletByAddress(pbKey.getAddress());

    let account: AccountBackup = {};
    account.address = wallet.address;
    account.mnemonic = this.keys.key;
    account.publicKey = pbKey.toHex();
    account.seed = bip39.mnemonicToSeedHex(account.mnemonic);
    account.wif = pvKey.toWIF();

    if (this.keys.secondKey) {
      account.secondMnemonic = this.keys.secondKey;
    }

    this.account = account;
  }

  private generateAccountFromEntropy() {
    let account: AccountBackup = {};

    account.entropy = this.entropy;
    account.mnemonic = bip39.entropyToMnemonic(account.entropy);

    let pvKey = PrivateKey.fromSeed(account.mnemonic, this.currentNetwork);
    let pbKey = pvKey.getPublicKey();

    account.address = pbKey.getAddress();
    account.publicKey = pbKey.toHex();
    account.wif = pvKey.toWIF();
    account.seed = bip39.mnemonicToSeedHex(account.mnemonic);

    this.account = account;
  }

}
