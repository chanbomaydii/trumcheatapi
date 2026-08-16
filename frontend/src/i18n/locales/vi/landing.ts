export default {
  // Trang chủ mới (dải số liệu thống kê + bảng giá kiểu departure board)
  landing: {
    stats: {
      models: 'Model đang phục vụ',
      uptime: 'Uptime 30 ngày',
      ttft: 'TTFT trung vị 24h',
      formats: 'Định dạng API tương thích'
    },
    board: {
      liveLabel: 'Bảng giá trực tiếp — cập nhật mỗi 60 giây',
      referenceLabel: 'Bảng giá tham khảo',
      unit: 'USD / 1 triệu token',
      columns: {
        model: 'Model',
        provider: 'Nhà cung cấp',
        input: 'Giá vào',
        output: 'Giá ra',
        // Must name "giá ra" (output price) explicitly — savingPct is computed
        // from the output price only, and a bare "Tiết kiệm" would read as a
        // claim about the whole row when the input-side saving can differ.
        savingOutput: 'Tiết kiệm giá ra'
      }
    },
    strip: {
      status: 'Tất cả hệ thống hoạt động',
      statusUptime: 'uptime {uptime}',
      latency: 'hà nội ⇄ us-east',
      latencyTtft: 'độ trễ cổng {ttft}'
    },
    nav: {
      modelBoard: 'Bảng model',
      pricing: 'Bảng giá',
      docs: 'Tài liệu',
      faq: 'Hỏi đáp',
      login: 'Đăng nhập',
      getApiKey: 'Lấy API key'
    },
    hero: {
      eyebrow: 'Cổng API hợp nhất',
      eyebrowModelCount: '{count} model đang phục vụ',
      titleLine1: 'Mọi model.',
      titleLine2: 'Một {emphasis}.',
      titleLine3: 'Rẻ hơn {pct}%.',
      titleLine3Plain: 'Rẻ hơn nhiều lần.',
      subtitle: 'Claude, GPT và Gemini chạy trên pool tài khoản subscription thật. Giữ nguyên SDK bạn đang dùng — đổi đúng một dòng {code}.',
      ctaPrimary: 'Lấy API key miễn phí',
      ctaSecondary: 'Xem bảng giá ↓',
      clockLabel: 'Cập nhật giá gần nhất'
    },
    steps: {
      secnum: '01 / CÁCH DÙNG',
      heading: 'Ba bước, xong trong hai phút',
      step1: {
        title: 'Tạo tài khoản',
        desc: 'Đăng ký bằng email hoặc Google. Nhận ngay credit dùng thử, không cần thẻ.'
      },
      step2: {
        title: 'Tạo API key',
        descWithCount: 'Một key duy nhất mở toàn bộ {count} model. Đặt hạn mức chi tiêu theo key.',
        descPlain: 'Một key duy nhất mở toàn bộ model đang hỗ trợ. Đặt hạn mức chi tiêu theo key.'
      },
      step3: {
        title: 'Đổi một dòng',
        desc: 'Trỏ base_url về TrumCheat. SDK, tool call, streaming giữ nguyên.'
      },
      code: {
        comment: '# Giữ nguyên SDK OpenAI, đổi đúng 2 dòng',
        greeting: 'Chào!'
      }
    },
    compat: {
      secnum: '02 / TƯƠNG THÍCH',
      heading: 'Nói đúng thứ tiếng SDK bạn đang dùng',
      badge: 'Tương thích'
    },
    faq: {
      secnum: '03 / HỎI ĐÁP',
      heading: 'Hỏi nhanh, đáp thẳng',
      q1: {
        question: 'Vì sao rẻ hơn giá gốc?',
        answer: 'Hệ thống chạy trên pool tài khoản subscription trả theo tháng, không mua token lẻ theo giá niêm yết. Phần chênh lệch được chia lại cho bạn.'
      },
      q2: {
        question: 'Key có bị khoá giữa chừng không?',
        answer: 'Pool tài khoản xoay vòng tự động. Một tài khoản gặp sự cố, request được chuyển sang tài khoản khác trong cùng phiên — bạn không thấy gián đoạn.'
      },
      q3: {
        question: 'Tính tiền như thế nào?',
        answer: 'Theo token thực dùng, đo ngay tại cổng. Trừ thẳng vào số dư, xem chi tiết từng request trong mục Thống kê. Không phí ẩn, không phí duy trì.'
      },
      q4: {
        question: 'Nạp tiền bằng cách nào?',
        answer: 'Chuyển khoản ngân hàng nội địa, ví điện tử, hoặc mã redeem. Số dư vào tài khoản ngay sau khi xác nhận.'
      },
      q5: {
        question: 'Có giới hạn tốc độ không?',
        answer: 'Không giới hạn cứng. Mỗi khoá tự đặt được hạn mức chi tiêu riêng để tránh vỡ ngân sách khi chạy agent.'
      },
      q6: {
        question: 'Nội dung request có bị lưu lại không?',
        answer: 'Mặc định chỉ ghi lại số token và metadata để tính cước. Nội dung prompt và phản hồi không được lưu trữ.'
      }
    },
    support: {
      secnum: '04 / HỖ TRỢ',
      heading: 'Người thật, trả lời thật',
      telegram: {
        channel: 'Kênh chính',
        title: 'Telegram',
        desc: 'Nhóm hỗ trợ kỹ thuật, thông báo bảo trì và cập nhật model mới.',
        note: '● Đội ngũ kỹ thuật theo dõi và phản hồi trực tiếp'
      },
      zalo: {
        channel: 'Trong nước',
        title: 'Zalo',
        desc: 'Hỗ trợ nạp tiền, hoá đơn và các vướng mắc thanh toán bằng tiếng Việt.',
        note: '● Hỗ trợ liên tục trong ngày'
      },
      email: {
        channel: 'Doanh nghiệp',
        title: 'Email',
        desc: 'Hạn mức riêng, hợp đồng, xuất hoá đơn VAT và tài khoản dùng chung cho đội.',
        note: '● Dành cho yêu cầu doanh nghiệp'
      },
      sla: {
        statusPage: 'Trang trạng thái công khai · lịch sử sự cố'
      }
    },
    cta: {
      heading: 'Bắt đầu trong 60 giây',
      subtitle: 'Không cần thẻ · Credit dùng thử miễn phí · Huỷ bất cứ lúc nào',
      button: 'Lấy API key →'
    },
    footer: {
      copyright: '© {year} TrumCheat API',
      links: 'Tài liệu · Trạng thái · Điều khoản · Telegram'
    }
  },

  batchImageGuide: {
    title: 'Tạo ảnh hàng loạt',
    description: 'Gửi nhiều prompt trong một tác vụ và tải ảnh đã tạo khi hoàn tất'
  },
  // Home Page
  home: {
    viewOnGithub: 'Xem trên GitHub',
    viewDocs: 'Xem tài liệu',
    docs: 'Tài liệu',
    switchToLight: 'Chuyển sang giao diện sáng',
    switchToDark: 'Chuyển sang giao diện tối',
    dashboard: 'Bảng điều khiển',
    login: 'Đăng nhập',
    getStarted: 'Bắt đầu ngay',
    goToDashboard: 'Vào bảng điều khiển',
    // Định vị giá trị hướng tới người dùng
    heroSubtitle: 'Một API key, dùng mọi model AI',
    heroDescription: 'Không cần quản lý nhiều gói thuê bao. Truy cập Claude, GPT, Gemini và nhiều model khác chỉ với một API key duy nhất',
    tags: {
      subscriptionToApi: 'Chuyển thuê bao thành API',
      stickySession: 'Duy trì phiên làm việc',
      realtimeBilling: 'Tính phí theo mức dùng'
    },
    // Phần điểm đau của người dùng
    painPoints: {
      title: 'Bạn có gặp những vấn đề này không?',
      items: {
        expensive: {
          title: 'Chi phí thuê bao cao',
          desc: 'Phải trả tiền cho nhiều gói thuê bao AI, cộng dồn mỗi tháng'
        },
        complex: {
          title: 'Tài khoản rối rắm',
          desc: 'Quản lý tài khoản và API key rải rác trên nhiều nền tảng khác nhau'
        },
        unstable: {
          title: 'Gián đoạn dịch vụ',
          desc: 'Tài khoản đơn lẻ dễ bị giới hạn tốc độ, làm gián đoạn công việc'
        },
        noControl: {
          title: 'Không kiểm soát được mức dùng',
          desc: 'Không biết tiền đã chi vào đâu, cũng không thể giới hạn mức dùng của từng thành viên'
        }
      }
    },
    // Phần giải pháp
    solutions: {
      title: 'Chúng tôi giải quyết những vấn đề này',
      subtitle: 'Ba bước đơn giản để dùng AI mà không phải lo lắng'
    },
    features: {
      unifiedGateway: 'Truy cập chỉ với một cú nhấp',
      unifiedGatewayDesc: 'Nhận một API key duy nhất để gọi tất cả model AI đã kết nối. Không cần đăng ký riêng lẻ.',
      multiAccount: 'Luôn ổn định',
      multiAccountDesc: 'Định tuyến thông minh qua nhiều tài khoản upstream với chuyển đổi dự phòng tự động. Nói lời tạm biệt với lỗi kết nối.',
      balanceQuota: 'Dùng bao nhiêu trả bấy nhiêu',
      balanceQuotaDesc: 'Tính phí theo mức sử dụng thực tế, có thể đặt giới hạn hạn mức. Theo dõi đầy đủ mức tiêu thụ của cả team.'
    },
    // Phần so sánh
    comparison: {
      title: 'Vì sao nên chọn chúng tôi?',
      headers: {
        feature: 'So sánh',
        official: 'Thuê bao chính hãng',
        us: 'Nền tảng của chúng tôi'
      },
      items: {
        pricing: {
          feature: 'Giá cả',
          official: 'Phí cố định hằng tháng, không dùng vẫn phải trả',
          us: 'Chỉ trả tiền cho phần đã dùng'
        },
        models: {
          feature: 'Lựa chọn model',
          official: 'Chỉ một nhà cung cấp duy nhất',
          us: 'Tự do chuyển đổi giữa các model'
        },
        management: {
          feature: 'Quản lý tài khoản',
          official: 'Quản lý riêng từng dịch vụ',
          us: 'Một key duy nhất, một bảng điều khiển'
        },
        stability: {
          feature: 'Độ ổn định',
          official: 'Tài khoản đơn lẻ dễ bị giới hạn tốc độ',
          us: 'Nhóm nhiều tài khoản, tự động chuyển đổi dự phòng'
        },
        control: {
          feature: 'Kiểm soát mức dùng',
          official: 'Không có',
          us: 'Có hạn mức và thống kê chi tiết'
        }
      }
    },
    providers: {
      title: 'Các model AI được hỗ trợ',
      description: 'Một API, nhiều lựa chọn',
      supported: 'Đã hỗ trợ',
      soon: 'Sắp ra mắt',
      claude: 'Claude',
      gemini: 'Gemini',
      antigravity: 'Antigravity',
      more: 'Thêm nữa'
    },
    // Phần CTA
    cta: {
      title: 'Sẵn sàng bắt đầu chưa?',
      description: 'Đăng ký ngay để nhận tín dụng dùng thử miễn phí và trải nghiệm truy cập AI liền mạch',
      button: 'Đăng ký miễn phí'
    },
    footer: {
      allRightsReserved: 'Bảo lưu mọi quyền.'
    }
  },

  // Key Usage Query Page
  keyUsage: {
    title: 'Tra cứu mức dùng API Key',
    subtitle: 'Nhập API Key của bạn để xem chi tiêu và tình trạng sử dụng theo thời gian thực',
    placeholder: 'sk-ant-mirror-xxxxxxxxxxxx',
    query: 'Tra cứu',
    querying: 'Đang tra cứu...',
    privacyNote: 'Key của bạn được xử lý cục bộ trên trình duyệt và sẽ không được lưu trữ',
    dateRange: 'Khoảng thời gian:',
    dateRangeToday: 'Hôm nay',
    dateRange7d: '7 ngày',
    dateRange30d: '30 ngày',
    dateRange90d: '90 ngày',
    dateRangeCustom: 'Tùy chỉnh',
    apply: 'Áp dụng',
    used: 'Đã dùng',
    detailInfo: 'Thông tin chi tiết',
    tokenStats: 'Thống kê Token',
    dailyDetail: 'Chi tiết theo ngày',
    modelStats: 'Thống kê mức dùng theo model',
    // Table headers
    date: 'Ngày',
    model: 'Model',
    requests: 'Số request',
    inputTokens: 'Token đầu vào',
    outputTokens: 'Token đầu ra',
    cacheCreationTokens: 'Tạo cache',
    cacheReadTokens: 'Đọc cache',
    cacheWriteTokens: 'Ghi cache',
    totalTokens: 'Tổng token',
    cost: 'Chi phí',
    // Status
    quotaMode: 'Chế độ hạn mức Key',
    walletBalance: 'Số dư ví',
    // Ring card titles
    totalQuota: 'Tổng hạn mức',
    limit5h: 'Giới hạn 5 giờ',
    limitDaily: 'Giới hạn ngày',
    limit7d: 'Giới hạn 7 ngày',
    limitWeekly: 'Giới hạn tuần',
    limitMonthly: 'Giới hạn tháng',
    // Detail rows
    remainingQuota: 'Hạn mức còn lại',
    expiresAt: 'Hết hạn lúc',
    todayExpires: '(hết hạn hôm nay)',
    daysLeft: '(còn {days} ngày)',
    usedQuota: 'Hạn mức đã dùng',
    resetNow: 'Sắp làm mới',
    subscriptionType: 'Loại thuê bao',
    subscriptionExpires: 'Thuê bao hết hạn',
    // Usage stat cells
    todayRequests: 'Request hôm nay',
    todayInputTokens: 'Đầu vào hôm nay',
    todayOutputTokens: 'Đầu ra hôm nay',
    todayTokens: 'Token hôm nay',
    todayCacheCreation: 'Tạo cache hôm nay',
    todayCacheRead: 'Đọc cache hôm nay',
    todayCost: 'Chi phí hôm nay',
    rpmTpm: 'RPM / TPM',
    totalRequests: 'Tổng request',
    totalInputTokens: 'Tổng đầu vào',
    totalOutputTokens: 'Tổng đầu ra',
    totalTokensLabel: 'Tổng Token',
    totalCacheCreation: 'Tổng tạo cache',
    totalCacheRead: 'Tổng đọc cache',
    totalCost: 'Tổng chi phí',
    avgDuration: 'Thời gian TB',
    // Messages
    enterApiKey: 'Vui lòng nhập API Key',
    querySuccess: 'Tra cứu thành công',
    queryFailed: 'Tra cứu thất bại',
    queryFailedRetry: 'Tra cứu thất bại, vui lòng thử lại sau',
    noDailyUsage: 'Chưa có dữ liệu mức dùng theo ngày',
  },

  // Setup Wizard
  setup: {
    title: 'Cài đặt Sub2API',
    description: 'Cấu hình cho hệ thống Sub2API của bạn',
    database: {
      title: 'Cấu hình cơ sở dữ liệu',
      description: 'Kết nối tới cơ sở dữ liệu PostgreSQL của bạn',
      host: 'Host',
      port: 'Port',
      username: 'Tên đăng nhập',
      password: 'Mật khẩu',
      databaseName: 'Tên cơ sở dữ liệu',
      sslMode: 'Chế độ SSL',
      passwordPlaceholder: 'Mật khẩu',
      ssl: {
        disable: 'Tắt',
        require: 'Bắt buộc',
        verifyCa: 'Xác thực CA',
        verifyFull: 'Xác thực toàn phần'
      }
    },
    redis: {
      title: 'Cấu hình Redis',
      description: 'Kết nối tới máy chủ Redis của bạn',
      host: 'Host',
      port: 'Port',
      username: 'Tên đăng nhập (tùy chọn)',
      password: 'Mật khẩu (tùy chọn)',
      database: 'Cơ sở dữ liệu',
      usernamePlaceholder: 'Để trống để dùng người dùng mặc định',
      passwordPlaceholder: 'Mật khẩu',
      enableTls: 'Bật TLS',
      enableTlsHint: 'Dùng TLS khi kết nối tới Redis (chứng chỉ CA công khai)'
    },
    admin: {
      title: 'Tài khoản quản trị',
      description: 'Tạo tài khoản quản trị viên của bạn',
      email: 'Email',
      password: 'Mật khẩu',
      confirmPassword: 'Xác nhận mật khẩu',
      passwordPlaceholder: 'Tối thiểu 8 ký tự',
      confirmPasswordPlaceholder: 'Xác nhận mật khẩu',
      passwordMismatch: 'Mật khẩu không khớp'
    },
    ready: {
      title: 'Sẵn sàng cài đặt',
      description: 'Kiểm tra lại cấu hình và hoàn tất cài đặt',
      database: 'Cơ sở dữ liệu',
      redis: 'Redis',
      adminEmail: 'Email quản trị viên'
    },
    status: {
      testing: 'Đang kiểm tra...',
      success: 'Kết nối thành công',
      testConnection: 'Kiểm tra kết nối',
      installing: 'Đang cài đặt...',
      completeInstallation: 'Hoàn tất cài đặt',
      completed: 'Cài đặt hoàn tất!',
      redirecting: 'Đang chuyển đến trang đăng nhập...',
      restarting: 'Dịch vụ đang khởi động lại, vui lòng đợi...',
      timeout: 'Việc khởi động lại dịch vụ đang mất nhiều thời gian hơn dự kiến. Vui lòng làm mới trang thủ công.'
    }
  },

  // Common
}
