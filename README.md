[angular-opui](https://github.com/opui/angular-opui) — angular UI 解决方案
==================================================

  By CMSZ运维运营前端组
--------------------------------------

## bower安装
```
    bower install -g angular-opui
```

### <i class="icon-file"></i>1.核心模块
--------------------------------------
#### 1.1 两个时间输入框，限制输入的是时间段，后一个时间输入框的最小值是前一个输入框的值，使用op-mindate和op-maxdate
```
  <div class="btn-group">
    <input type="text" class="form-control input-date" opdatepicker="startDateParams" op-mindate="endDateParams"
        ng-model="queryParams.startDate" ng-change="changeStartDate()" readOnly style="width:130px;">
    &nbsp;-&nbsp;
    <input type="text" class="form-control input-date" opdatepicker="endDateParams" op-maxdate="startDateParams"
        ng-model="queryParams.endDate" readOnly style="width:130px;">
  </div>
```
#### 1.2 加载中提示、复制功能、等大批功能正在筹建中...

### <i class="icon-file"></i>2.表单模块
--------------------------------------
#### 2.1 表单验证
已实现大部分表单验证：必填验证（required）、特殊字符验证(op-special)、长度验证(op-length)、数据库验证(op-validate)、正则表达式验证(pattern)等，并且实现自定义提示信息(show-msg, show-name)。

示例1：必填并且不能输入特殊字符，并且在50个长度之内，
`<input ng-model="task.taskName" type="text" name="taskName" required op-special show-msg="请输入1-50汉字、英文、数字或_-" op-length="50"/>`

示例2：数据库不能重复不能包含特殊字符，显示自定义提示信息
`<input class="radius-input" type="text" ng-model="service.serviceName" name="serviceName" required op-special show-msg="请输入1-50位的中英文或数字的字符串，不能输入特殊字符"  op-validate="serviceIsExist" old-value="{{oldName}}" op-length="50"/>`

示例3：只能输入1-60的正整数
`<input class="radius-input" ng-model="service.commandTimeout"  show-msg="请输入1-60的正整数！" required pattern="^([1-9]|[1-5][0-9]|60)$" type="number" min="1" max="60" ng-disabled="isDefault"/>`

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


### <i class="icon-file"></i>3.表格模块
--------------------------------------
#### 3.1 冻结表头和点击排序
```
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

### <i class="icon-file"></i>4.图形模块
--------------------------------------
#### 4.1 期待中...
