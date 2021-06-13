export default ($, _) => {
  var
    i = 0,
    n = $(_),
    s = $('ube').upgrade,
    t = typeof n == 'function' ? n : O(n),
    a = document.querySelectorAll('[data-ube="' + _ + '"]')
  ;
  while (i < a.length) {
    a[i].removeAttribute('data-ube');
    s(a[i++], t);
  }
  function O(n) {
    for (var k in n) {
      if (
        k === 'default' ||
        (typeof n[k] == 'function' && /^[A-Z]/.test(k))
      )
        return n[k];
    }
  }
};
