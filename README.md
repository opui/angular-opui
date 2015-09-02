[angular](https://github.com/opui/angular-opui) — angular UI 解决方案
==================================================

Contribution Guides
--------------------------------------

## 安装，bower安装
```
    bower install -g angular-opui
```

### 列子1：冻结表头

```
    <table class="table table-bordered table-striped table-hover" id="tt" op-freeze-header>
      <thead>
        <tr>
          <th ng-click="checkedAllTrade()">
             <input type="checkbox" ng-checked="allIsChecked">
          </th> 
          <th>查看详情</th>
        </tr>
      </thead>
      <tbody>
        <tr ng-repeat="trade in tradeList" ng-style="{'color': getColor(trade)}" ng-repeat-finish>
          <td ng-click="checkedTrade(trade)"><input type="checkbox" ng-checked="trade.$checked"></td>
          <td ng-if="trade.modHistory.length" ng-click="showHistory(trade)" style="cursor: pointer;">
            <a><i class="glyphicon glyphicon-search" style="margin-right: 5px;"></i>查看</a>
          </td>
          <td ng-if="!trade.modHistory.length" style="color: #999999;"><i class="glyphicon glyphicon-search" style="margin-right: 5px;"></i>查看</td>
        </tr>
      </tbody>
    </table>
```
