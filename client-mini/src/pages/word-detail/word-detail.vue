      &.mastered {
        background: #e3f2fd;
        color: #2196f3;
      }
    }
    
    .level-tag {
      background: #f5f5f5;
      color: #666;
    }
    
    .difficulty-tag {
      &.easy {
        background: #e8f5e9;
        color: #4caf50;
      }
      
      &.medium {
        background: #fff3e0;
        color: #ff9800;
      }
      
      &.hard {
        background: #ffebee;
        color: #f44336;
      }
    }
  }
  
  .category-section, .definitions-section, .review-section, .notes-section, .source-section {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    
    .section-title {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
      padding-bottom: 20rpx;
      border-bottom: 2rpx solid #f0f0f0;
    }
  }
  
  .category-section {
    .categories {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;
      
      .category-tag {
        background: #e3f2fd;
        color: #007aff;
        font-size: 26rpx;
        padding: 12rpx 24rpx;
        border-radius: 20rpx;
      }
    }
  }
  
  .definitions-section {
    .definitions {
      .definition-item {
        margin-bottom: 30rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .definition-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 20rpx;
          
          .pos {
            font-size: 26rpx;
            color: #007aff;
            font-weight: bold;
            margin-right: 20rpx;
            min-width: 60rpx;
          }
          
          .meaning {
            font-size: 28rpx;
            color: #333;
            line-height: 1.5;
            flex: 1;
          }
        }
        
        .examples {
          background: #f8f9fa;
          border-radius: 12rpx;
          padding: 20rpx;
          
          .example-item {
            margin-bottom: 15rpx;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            .example-en {
              display: block;
              font-size: 26rpx;
              color: #333;
              font-style: italic;
              margin-bottom: 8rpx;
            }
            
            .example-zh {
              display: block;
              font-size: 24rpx;
              color: #666;
            }
          }
        }
      }
    }
  }
  
  .review-section {
    .review-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30rpx;
      
      .info-item {
        display: flex;
        flex-direction: column;
        
        .info-label {
          font-size: 24rpx;
          color: #666;
          margin-bottom: 8rpx;
        }
        
        .info-value {
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
          
          &.due-soon {
            color: #ff9500;
          }
        }
      }
    }
  }
  
  .notes-section {
    .notes-content {
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
      padding: 20rpx;
      background: #f8f9fa;
      border-radius: 12rpx;
    }
  }
  
  .source-section {
    .source-info {
      display: flex;
      flex-direction: column;
      gap: 15rpx;
      
      .source-type, .source-from {
        font-size: 26rpx;
        color: #666;
      }
      
      .source-url {
        font-size: 26rpx;
        color: #007aff;
        text-decoration: underline;
        
        &:active {
          opacity: 0.7;
        }
      }
    }
  }
  
  .time-info {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 15rpx;
    font-size: 24rpx;
    color: #999;
    text-align: center;
  }
}

// 空状态
.empty-state {
  padding: 100rpx 30rpx;
  
  .back-btn {
    margin-top: 40rpx;
  }
}

// 底部操作栏
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
  
  .action-buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .review-btn {
      flex: 1;
      background: linear-gradient(135deg, #007aff, #5856d6);
      border-radius: 50rpx;
      padding: 24rpx 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15rpx;
      
      &:active {
        opacity: 0.9;
      }
      
      text {
        color: white;
        font-size: 28rpx;
        font-weight: 500;
      }
    }
    
    .action-group {
      display: flex;
      gap: 30rpx;
      margin-left: 30rpx;
      
      .action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10rpx;
        border-radius: 12rpx;
        
        &:active {
          background: #f8f9fa;
        }
        
        u-icon {
          margin-bottom: 8rpx;
        }
        
        text {
          font-size: 22rpx;
        }
        
        &.edit-btn text {
          color: #007aff;
        }
        
        &.delete-btn text {
          color: #ff3b30;
        }
      }
    }
  }
}
</style>