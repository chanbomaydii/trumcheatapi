/** Channel Monitor V2 (user + admin passive monitor UI) */
export default {
  channelMonitorV2: {
    title: 'Giám sát kênh',
    updating: 'Đang cập nhật dữ liệu',
    updatedTo: 'Đã cập nhật đến {time}',
    partialCoverage: 'Dữ liệu lịch sử chưa đầy đủ',
    bootstrap: {
      title: 'Đang xây dựng dữ liệu giám sát lịch sử',
      description:
        'Khi bật lần đầu, tổng hợp thụ động sẽ âm thầm điền dữ liệu cho các khung 90 phút, 24 giờ, 7 ngày, và 30 ngày ở nền. Tất cả các khoảng sẽ đầy đủ khi hoàn tất.',
      progress: 'Hoàn tất {percent}%',
      working: 'Đang tổng hợp ở nền…',
    },
    timeRange: 'Khoảng thời gian',
    clearFilters: 'Đặt lại',
    refreshingFilters: 'Bộ lọc đã thay đổi; đang làm mới ma trận, xu hướng, và chi tiết…',
    switchingData: 'Đang chuyển đổi dữ liệu đã lọc…',
    summaryAria: 'Tóm tắt khoảng đã chọn',
    loadFailed: 'Tải giám sát kênh thất bại',
    detailLoadFailed: 'Tải chi tiết giám sát kênh thất bại',
    otherModels: 'Model khác',
    ignored: 'Đã bỏ qua',
    currentUser: 'Người dùng hiện tại',
    ranges: { '90m': '90 phút', '24h': '24 giờ', '7d': '7 ngày', '30d': '30 ngày' },
    filters: {
      platform: 'Nền tảng', allPlatforms: 'Tất cả', group: 'Nhóm', allGroups: 'Tất cả', model: 'Model', allModels: 'Tất cả',
      empty: 'Không có tùy chọn', selectedCount: '{count}', labelValue: '{label}: {value}'
    },
    groupBy: {
      label: 'Nhóm theo', platform: 'Nền tảng', platformGroup: 'Nền tảng / Nhóm', platformModel: 'Nền tảng / Model', platformGroupModel: 'Nền tảng / Nhóm / Model'
    },
    trendView: { label: 'Xem xu hướng', pulse: 'Ma trận xung', line: 'Biểu đồ đường' },
    healthMode: { label: 'Hiển thị tình trạng', overall: 'Tổng thể', success: 'Tỷ lệ lỗi', ttft: 'Token đầu tiên', cache: 'Tỷ lệ cache' },
    tabs: { aria: 'Chiều chi tiết', models: 'Model', errors: 'Nguyên nhân lỗi', users: 'Xếp hạng người dùng' },
    metrics: {
      rpm: 'RPM',
      tpm: 'TPM',
      tps: 'Token/s',
      rpmDetail: 'Request mỗi phút',
      tpmDetail: 'Token mỗi phút',
      tpsDetail: 'Suy ra từ TPM ÷ 60',
      errorRate: 'Tỷ lệ lỗi',
      ttft: 'Token đầu tiên',
      ttftP50: 'Token đầu tiên P50',
      durationP50: 'Thời lượng P50',
      cacheRate: 'Tỷ lệ cache',
      cacheDetail: 'Tỷ lệ đọc cache',
      successRate: 'Tỷ lệ thành công',
      successRateValue: 'Tỷ lệ thành công {value}',
      errorRateValue: 'Tỷ lệ lỗi {value}',
      rpmValue: 'RPM {value}',
      tpmValue: 'TPM {value}',
      tpsValue: 'Token/s {value}',
      ttftValue: 'Token đầu tiên {value}',
      durationValue: 'Thời lượng {value}',
      cacheRateValue: 'Tỷ lệ cache {value}',
    },
    table: { platformModel: 'Nền tảng / Model', rank: 'Hạng', user: 'Người dùng' },
    empty: { title: 'Không có dữ liệu để hiển thị', description: 'Hãy thử thay đổi khoảng thời gian hoặc bộ lọc' },
    bucket: { minutes: 'Khối {count} phút', hours: 'Khối {count} giờ', days: 'Khối {count} ngày' },
    matrix: {
      title: 'Xu hướng khả dụng', description: 'Mỗi hàng là một chiều kênh và mỗi khối là một khoảng tổng hợp; di chuột để xem chi tiết', wheelZoom: 'Cuộn chuột trên khối để phóng to (khoảng hẹp hơn, khối rộng hơn)', wheelZoomX: 'Cuộn chuột trên khối để phóng to (khoảng hẹp hơn, khối rộng hơn)', dimension: 'Chiều kênh', emptyTitle: 'Không có dữ liệu ma trận cho khoảng đã chọn', legendAria: 'Chú giải điểm tình trạng', bad: 'Xấu', good: 'Tốt', healthyLegend: 'Khỏe mạnh (≥80)', warningLegend: 'Cần chú ý (50–79)', criticalLegend: 'Nghiêm trọng (<50)', unknownLegend: 'Không có lưu lượng / mẫu chưa đủ', noTraffic: 'Không có lưu lượng trong khoảng này', noTrafficAt: '{time} · không có lưu lượng', scoreLine: 'Điểm tình trạng {score}', resetZoom: 'Đặt lại thu phóng'
    },
    chart: {
      title: 'Xu hướng khả dụng', description: 'Xu hướng đã làm mượt: tỷ lệ lỗi · token đầu tiên P50 · tỷ lệ cache', emptyTitle: 'Không có dữ liệu xu hướng cho khoảng đã chọn', errorLegend: 'Tỷ lệ lỗi (trục trái %)', cacheLegend: 'Tỷ lệ cache (trục trái %)', ttftLegend: 'Token đầu tiên P50 (trục phải)', errorDataset: 'Xu hướng tỷ lệ lỗi %', cacheDataset: 'Xu hướng tỷ lệ cache %', ttftDataset: 'Xu hướng token đầu tiên P50 (ms)', percentAxis: 'Tỷ lệ %', resetZoom: 'Đặt lại thu phóng'
    },
    errorDetail: { http: 'HTTP {code}', upstream: 'Upstream {code}', noMessage: 'Không có thông báo lỗi', empty: 'Chỉ hiện tỷ lệ theo danh mục (thông báo mẫu chỉ dành cho quản trị viên)' },
    errorCategories: {
      content_policy: 'Chính sách nội dung', authentication: 'Xác thực', context_limit: 'Giới hạn ngữ cảnh', invalid_request: 'Request không hợp lệ', model_unsupported: 'Model không được hỗ trợ', group_access: 'Quyền truy cập nhóm', quota_or_balance: 'Hạn mức hoặc số dư', account_pool_unavailable: 'Bể tài khoản không khả dụng', rate_or_capacity: 'Tốc độ hoặc dung lượng', timeout: 'Hết thời gian chờ', transport_or_stream: 'Truyền tải hoặc stream', upstream_forbidden: 'Upstream từ chối', not_found: 'Không tìm thấy', client_cancelled: 'Client đã hủy', upstream_5xx: 'Upstream 5xx', internal: 'Nội bộ', other: 'Khác'
    },
    rank: {
      gold: 'Hạng 1 vàng',
      silver: 'Hạng 2 bạc',
      bronze: 'Hạng 3 đồng',
      place: 'Hạng {n}',
      unranked: 'Chưa xếp hạng',
    },
    settings: {
      title: 'Cấu hình giám sát dữ liệu V2',
      description:
        'Cấu hình các chiều tổng hợp mức dùng thụ động (nền tảng / model / nhóm) và tần suất làm mới. Màu tình trạng và chi tiết trên trang /monitor của người dùng hiển thị tỷ lệ, RPM, và TPM — không phải khối lượng request tuyệt đối.',
      save: 'Lưu',
      loading: 'Đang tải…',
      loadFailed: 'Tải cấu hình V2 thất bại',
      saveSuccess: 'Đã lưu cấu hình giám sát V2',
      saveFailed: 'Lưu cấu hình V2 thất bại',
      modeBanner:
        'Chế độ hệ thống hiện là {mode}. Tổng hợp theo phút V2 sẽ không chạy; cấu hình này có thể chuẩn bị trước và có hiệu lực sau khi chuyển sang {modeV2}. Thay đổi chế độ tại Cài đặt hệ thống → Công tắc tính năng.',
      modeClosed: 'Giám sát kênh đã tắt',
      modeV1: 'Dò chủ động V1',
      modeV2: 'Giám sát thụ động V2',
      enableTitle: 'Bật tổng hợp V2',
      enableHint:
        'Áp dụng khi chế độ hệ thống là V2. Tắt mục này chỉ dừng tổng hợp của cấu hình này; công tắc chế độ hệ thống vẫn nằm ở Công tắc tính năng.',
      refreshTitle: 'Chu kỳ tổng hợp',
      refreshHint: 'Ảnh hưởng đến độ chi tiết thời gian ma trận và tần suất làm mới',
      refreshAria: 'Chu kỳ tổng hợp',
      platformsTitle: 'Nền tảng và model',
      platformsHint:
        'Để trống = hiển thị tất cả tên model thực; khi điền, chỉ các model được liệt kê có hàng riêng và phần còn lại gộp vào "Khác"',
      modelsPlaceholder: 'Trống = tất cả model thực; hoặc liệt kê model phổ biến (còn lại → Khác)',
      badgeAllModels: 'Tất cả model',
      badgeOther: '+ Khác',
      groupsTitle: 'Nhóm được giám sát',
      groupsSelected: 'Đã chọn {count} nhóm',
      groupsAll: 'Tất cả nhóm',
      groupsEmpty: 'Không có nhóm khả dụng',
      errorsTitle: 'Danh mục lỗi và bỏ qua',
      errorsHint:
        'Các danh mục được đánh dấu "bỏ qua" bị loại khỏi tỷ lệ lỗi và điểm tình trạng, nhưng vẫn hiển thị mờ trong phân tích lỗi. Lỗi không khớp gộp vào "Khác".',
      ignoredSummary: 'Bỏ qua {ignored} danh mục · tính vào tỷ lệ lỗi {counted} danh mục',
      healthTitle: 'Ngưỡng tình trạng',
      healthHint:
        'Kiểm soát dải màu hiển thị cho người dùng và điểm tổng thể. Mặc định được nới lỏng để tỷ lệ lỗi nhỏ hoặc cache thấp không ngay lập tức hiện là không khỏe mạnh.',
      fields: {
        minimumSample: 'Số mẫu tối thiểu',
        warningError: 'Tỷ lệ lỗi cần chú ý %',
        criticalError: 'Tỷ lệ lỗi nghiêm trọng %',
        targetTtft: 'TTFT mục tiêu ms',
        warningTtft: 'TTFT cần chú ý ms',
        criticalTtft: 'TTFT nghiêm trọng ms',
        warningCache: 'Tỷ lệ cache cần chú ý %',
        criticalCache: 'Tỷ lệ cache nghiêm trọng %',
      },
      namedModelsEmpty: 'Danh sách model theo nền tảng đang trống: mọi tên model thực sẽ được hiển thị (không gộp vào "Khác").',
      namedModelsCount: 'Đang hiển thị {count} chiều model được đặt tên; model không được liệt kê gộp vào "Khác" theo từng nền tảng.',
      userContractTitle: 'Cam kết hiển thị cho người dùng',
      userContract: {
        health: 'Trọng số màu tình trạng: tỷ lệ lỗi 60% + token đầu tiên P50 20% + tỷ lệ cache 20% (ngưỡng có thể cấu hình ở trên)',
        trend: 'Xu hướng có thể chuyển đổi giữa ma trận xung và biểu đồ đường (lỗi · cache · token đầu tiên)',
        latency: 'Độ trễ hiển thị AVG · P50 · P90; không hiển thị số lượng request / lỗi tuyệt đối',
        models: 'Danh sách model trống hiển thị tên thực và không bao giờ gộp hết vào "Khác"',
      },
    },
    admin: {
      descriptionV1:
        'Chế độ hệ thống là dò chủ động V1: quản lý các bộ giám sát dò và chạy kiểm tra ngay; tổng hợp V2 không chạy.',
      descriptionV2:
        'Chế độ hệ thống là giám sát thụ động V2: cấu hình các chiều tổng hợp; dò chủ động V1 không chạy.',
      tabAria: 'Quản lý giám sát',
      tabV2: 'Cấu hình giám sát dữ liệu V2',
      tabV1Active: 'Dò chủ động V1',
      tabV1History: 'Lịch sử V1 (dò không hoạt động trong chế độ hiện tại)',
    },
  },
}
