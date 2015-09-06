[angular-opui](https://github.com/opui/angular-opui) — angular UI 解决方案
==================================================

  By CMSZ运维运营前端组
--------------------------------------

## bower安装
```bash
    bower install -g angular-opui
```

### 1.核心模块
--------------------------------------
#### 1.1 两个时间输入框，限制输入的是时间段，后一个时间输入框的最小值是前一个输入框的值，使用op-mindate和op-maxdate
```html
  <div class="btn-group">
    <input type="text" class="form-control input-date" opdatepicker="startDateParams" op-mindate="endDateParams"
        ng-model="queryParams.startDate" ng-change="changeStartDate()" readOnly style="width:130px;">
    &nbsp;-&nbsp;
    <input type="text" class="form-control input-date" opdatepicker="endDateParams" op-maxdate="startDateParams"
        ng-model="queryParams.endDate" readOnly style="width:130px;">
  </div>
```
#### 1.2 加载中提示、复制功能、等大批功能正在筹建中...

### 2.表单模块
--------------------------------------
#### 2.1 表单验证
已实现大部分表单验证：必填验证（required）、特殊字符验证(op-special)、长度验证(op-length)、数据库验证(op-validate)、正则表达式验证(pattern)等，并且实现自定义提示信息(show-msg, show-name)。

示例1：必填并且不能输入特殊字符，并且在50个长度之内
```html
<input ng-model="task.taskName" type="text" name="taskName" required op-special show-msg="请输入1-50汉字、英文、数字或_-" op-length="50"/>
```

示例2：数据库不能重复不能包含特殊字符，显示自定义提示信息
```html
<input class="radius-input" type="text" ng-model="service.serviceName" name="serviceName" required op-special show-msg="请输入1-50位的中英文或数字的字符串，不能输入特殊字符"  op-validate="serviceIsExist" old-value="{{oldName}}" op-length="50"/>
```

示例3：只能输入1-60的正整数
```html
<input class="radius-input" ng-model="service.commandTimeout"  show-msg="请输入1-60的正整数！" required pattern="^([1-9]|[1-5][0-9]|60)$" type="number" min="1" max="60" ng-disabled="isDefault"/>
```

示例4：输入一个正整数段，有大小限制
```html
  <div class="btn-group">
    <input type="number" class="form-control" ng-model="queryParams.failNumMin" style="width:80px;" op-length="7" min="0" max="{{queryParams.failNumMax}}">
  </div>
  <div class="btn-group">
    &nbsp;至&nbsp;
    <input type="number" class="form-control" ng-model="queryParams.failNumMax" style="width:80px;" op-length="7" min="{{queryParams.failNumMin}}">
  </div>
```

>**Note**：

> - 自定义提示插件依赖于bootstrap，下一步准备实现自己的提示插件
> - op-validate='urlStr'数据库验证指令后面的**urlStr**，需要在URL配置文件配置

#### 2.2 表单提交op-submit
目前已到第五版本，可以实现阻止重复提交、点击提示没有验证通过的字段。使用op-submit。
```html
  <button type="button" class="btn btn-success left-20" op-submit="queryChartAndTable()">
    <i class="glyphicon glyphicon-search"></i>
    查询
  </button>
```
>**Note**：

> - 自定义提示插件依赖于bootstrap，下一步准备实现自己的提示插件
> - 定义2.1的验证指令，必须要写提交指令，否则添加的验证指令的将不生效

#### 2.3 输入Enter提交表单op-enter
```html 
<div class="yy_content_header" ng-init="initPage()" op-enter="queryChartAndTable()">
```

#### 2.4 多选op-check
查询条件的多选指令，默认选择全部，自动同步到$scope.queryParams中，支持ng-show和ng-disabled。指令op-check，input-width熟悉定义input展示框的长度，check-style属性定义下拉多选的样式。
**js:**
```js
$scope.provinceCodeList = [{name: "北京", code: "100"}, {name: "广东", code: "200"}];
$scope.queryParams = {provinceCode: ''}; //查询条件
```
**html:**
```html 
<div class="form-group" op-check="provinceCodeList" name="省份" input-width="130px" check-style="float:left;width:80px">
</div>
```

#### 2.5 单选op-check-one
查询条件的单选，自动同步到$scope.queryParams中，支持ng-show和ng-disabled。指令op-check-one，input-width熟悉定义input展示框的长度，check-style属性定义下拉多选的样式。
**js:**
```js
$scope.is5Alist = [{name: '全部', code: '-1'}, {name: '5A', code: '1'}, {name: '非5A', code: '0'}];
$scope.queryParams = {is5A: '', ...};
```
**html:**
```html 
<div class="form-group" op-check-one="is5AList" name="是否5A类"></div>
```

### 3.表格模块
--------------------------------------
#### 3.1 冻结表头op-freeze-header
op-freeze-header='id'的id字符串是滚动层的DIV，默认是父层DIV。要配合ng-repeat-finish指令使用。有显示和隐藏的配合show属性操作，表格多选也是可以的。
```html
    <table class="table table-striped table-hover table-bordered" op-freeze-header='itTable' show="tableIsShow">
        <thead>
          <tr>
              <th>序号</th>
              <th>账期</th>
              <th>业务线</th>
              <th>省代码</th>
              <th>省公司</th>
              <th>二级返回码</th>
              <th>错误描述</th>
              <th>失败笔数</th>
          </tr>
        </thead>
        <tbody>
          <tr ng-repeat="fail in tableData" ng-repeat-finish>
              <td>{{($index + 1) + page.pageSize * (page.currentPage - 1)}}</td>
              <td>{{fail.settleDate}}</td>
              <td>{{fail.bizType | bizTypeName}}</td>
              <td>{{fail.orgCode}}</td>
              <td data-toggle="modal" data-target="#myModal" ng-click="queryDetaileList(fail)" style="cursor:pointer"><a style="color:#00f;">{{fail.orgCode | displayProvince}}</td>
              <td>{{fail.subResCode}}</td>
              <td>{{fail.subRspDesc}}</td>
              <td>{{fail.failedNum}}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td colspan="2" style="color:#f00;">笔数汇总(笔)</td>
              <td style="color:#f00;">{{totalNum}}</td>
          </tr>
        </tfoot>
    </table>
```

#### 3.2 冻结表头和点击排序
先在table上添加list属性，值是表格数据列表；在需要排序的字段，添加sortable属性，值是排序的字段。
```html
    <table class="table table-striped table-hover table-bordered" op-freeze-header show="tableIsShow" list="tableData">
        <thead>
          <tr>
              <th>序号</th>
              <th sortable="settleDate">账期</th>
              <th>业务线</th>
              <th sortable="orgCode">省代码</th>
              <th>省公司</th>
              <th sortable="subResCode">二级返回码</th>
              <th>错误描述</th>
              <th sortable="failedNum">失败笔数</th>
          </tr>
        </thead>
        <tbody>
          <tr ng-repeat="fail in tableData" ng-repeat-finish>
              <td>{{($index + 1) + page.pageSize * (page.currentPage - 1)}}</td>
              <td>{{fail.settleDate}}</td>
              <td>{{fail.bizType | bizTypeName}}</td>
              <td>{{fail.orgCode}}</td>
              <td data-toggle="modal" data-target="#myModal" ng-click="queryDetaileList(fail)" style="cursor:pointer"><a style="color:#00f;">{{fail.orgCode | displayProvince}}</td>
              <td>{{fail.subResCode}}</td>
              <td>{{fail.subRspDesc}}</td>
              <td>{{fail.failedNum}}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td colspan="2" style="color:#f00;">笔数汇总(笔)</td>
              <td style="color:#f00;">{{totalNum}}</td>
          </tr>
        </tfoot>
    </table>
```

### 4.图形模块
--------------------------------------
#### 4.1 期待中...
