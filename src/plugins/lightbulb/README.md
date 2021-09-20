# NatureRemoLightbulb plugin

明るさの設定値に合わせて個別のコマンドを送信できるようにしたもの

## 設定例

```json
{
  "accessories": [
    {
      "accessory": "NatureRemoLightbulb",
      "name": "{照明の名前}",
      "accessToken": "{Nature Remoアカウントの Access token}",
      "id": "{照明のAppliance ID}",
      "brightnessMapper": {
        "0": {
          "button": "off"
        },
        "20": {
          "button": "night"
        },
        "40": {
          "signal": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        },
        "60": {
          "signal": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        },
        "80": {
          "button": "on"
        },
        "100": {
          "button": "on-100"
        }
      }
    }
  ]
}
```
