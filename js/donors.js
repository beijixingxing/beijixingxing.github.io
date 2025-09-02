﻿// 动态加载捐赠者名单
async function loadDonors() {
  console.log('开始加载捐赠者数据...');
  try {
    // 1. 加载捐赠者名单文件
    // 添加错误处理和超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('/捐赠者.txt?' + new Date().getTime(), {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log('请求URL:', response.url);
    console.log('文件加载状态:', response.status);
    if (!response.ok) throw new Error('文件加载失败');

    const text = await response.text();

    // 2. 去重处理
    let donors = text
      .split('\n')
      .map(name => name.trim())
      .filter(name => name !== '');

    // 使用Set去重
    donors = [...new Set(donors)];

    // 3. 按名字长度排序
    donors.sort((a, b) => {
      const lenDiff = a.length - b.length;
      return lenDiff !== 0 ? lenDiff : a.localeCompare(b);
    });

    // 4. 渲染到页面
    const visiblePart = document.getElementById('visible-contributors');
    const morePart = document.getElementById('more-contributors');
    if (!visiblePart || !morePart) return;

    // 更新捐赠者人数
    const counterSelectors = ['#donor-count', '#donor-total-count'];
    counterSelectors.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.textContent = donors.length;
        element.classList.remove('text-yellow-500', 'text-red-600');
        element.classList.add('text-red-600', 'text-lg');
      }
    });

    // 清空容器
    visiblePart.innerHTML = '';
    morePart.innerHTML = '';

    const visibleLimit = 33; // 默认显示3行 (11列 * 3行)

    donors.forEach((donor, index) => {
      const donorElement = document.createElement('div');
      donorElement.className = 'contributor-item';
      donorElement.innerHTML = `<span class="contributor-name">${donor}</span>`;
      donorElement.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
      donorElement.style.borderColor = 'rgba(233, 236, 239, 0.3)';
      donorElement.style.backdropFilter = 'blur(2px)';

      if (index < visibleLimit) {
        visiblePart.appendChild(donorElement);
      } else {
        morePart.appendChild(donorElement);
      }
    });

    // 渲染完成后，调用函数更新视图状态
    if (typeof updateDonorViewState === 'function') {
      updateDonorViewState();
    }
  } catch (error) {
    console.error('加载捐赠者名单失败:', error);
    const countElements = document.querySelectorAll('[id^="donor"]');
    countElements.forEach(el => {
      el.textContent = '加载失败';
      el.classList.add('text-yellow-500');
    });

    const container = document.getElementById('donors-container');
    if (container) {
      container.innerHTML = `
                <div class="text-center py-4 text-yellow-600">
                    <i class="fa fa-exclamation-triangle mr-2"></i>
                    捐赠者名单加载失败，请刷新重试
                </div>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDonors();
});
